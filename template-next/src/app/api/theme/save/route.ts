import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { NextResponse } from 'next/server'
import type { ThemeSavePayload } from '@/lib/theme/types'

export const runtime = 'nodejs'

/** Works whether the project uses a src/ directory or not (Next.js supports both). */
function srcRoot(): string {
  return fs.existsSync(path.join(process.cwd(), 'src')) ? 'src' : '.'
}

function themeRoot() {
  return path.join(process.cwd(), srcRoot(), 'styles/theme')
}

function replaceCssVar(css: string, name: string, value: string): string {
  const re = new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`)
  if (re.test(css)) {
    return css.replace(re, `$1${value}$3`)
  }
  return css
}

/** Replace the Nth (0-based) occurrence of `--name: …;` in a CSS file. */
function replaceCssVarAtOccurrence(
  css: string,
  name: string,
  value: string,
  occurrence: number
): string {
  const re = new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`, 'g')
  let matchIndex = 0
  return css.replace(re, (full, prefix, _old, suffix) => {
    if (matchIndex++ === occurrence) {
      return `${prefix}${value}${suffix}`
    }
    return full
  })
}

function ensureColorVar(css: string, name: string, hex: string): string {
  const varName = name.startsWith('--') ? name : `--${name}`
  if (css.includes(`${varName}:`)) {
    return replaceCssVar(css, varName, hex)
  }
  // Insert after shade scales block — before semantic tokens comment if present
  const marker = '  /* Semantic tokens'
  if (css.includes(marker)) {
    return css.replace(marker, `  ${varName}: ${hex};\n\n${marker}`)
  }
  // Fallback: append inside first :root {
  return css.replace(/:root\s*\{/, `:root {\n  ${varName}: ${hex};`)
}

function appendTypographyRole(
  css: string,
  id: string,
  t: {
    fontFamily: string
    fontSize: string
    fontWeight: string
    lineHeight: string
    letterSpacing: string
  }
): string {
  const slug = id.replace(/^typography-/, '')
  const block = `
.typography-${slug} {
  --typography-${slug}-font-family: ${t.fontFamily};
  --typography-${slug}-font-size: ${t.fontSize};
  --typography-${slug}-font-weight: ${t.fontWeight};
  --typography-${slug}-line-height: ${t.lineHeight};
  --typography-${slug}-letter-spacing: ${t.letterSpacing};

  font-family: var(--typography-${slug}-font-family);
  font-size: var(--typography-${slug}-font-size);
  font-weight: var(--typography-${slug}-font-weight);
  line-height: var(--typography-${slug}-line-height);
  letter-spacing: var(--typography-${slug}-letter-spacing);
}
`
  if (css.includes(`.typography-${slug}`)) return css
  return css.trimEnd() + '\n' + block
}

function writeFontsCss(
  _existing: string,
  fonts: ThemeSavePayload['customFonts'],
  values: Record<string, string>
): string {
  const faceBlocks: string[] = []
  const varLines: string[] = []
  const googleImports: string[] = []

  for (const f of fonts) {
    if (f.source === 'file' && f.path) {
      const format = f.path.endsWith('.ttf')
        ? 'truetype'
        : f.path.endsWith('.otf')
          ? 'opentype'
          : f.path.endsWith('.woff')
            ? 'woff'
            : 'woff2'
      faceBlocks.push(`@font-face {
  font-family: '${f.id}';
  src: url('${f.path}') format('${format}');
  font-display: swap;
}`)
      varLines.push(`  --font-${f.id}: '${f.id}', sans-serif;`)
    } else if (f.source === 'google') {
      const family = encodeURIComponent(f.googleFamily)
      const weights = (f.weights || '400;700').replace(/,/g, ';')
      googleImports.push(
        `@import url('https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap');`
      )
      varLines.push(`  --font-${f.id}: '${f.googleFamily}', sans-serif;`)
    }
  }

  const heading = values['--font-heading'] ?? 'var(--font-sans)'
  return `/* ==========================================================================
   Font Families
   ==========================================================================
   \`--font-sans\` / \`--font-mono\` come from next/font (layout.tsx).
   Custom fonts below are managed by /theme-editor.
   ========================================================================== */

${googleImports.join('\n')}
${faceBlocks.join('\n\n')}
:root {
  --font-heading: ${heading};
${varLines.join('\n')}
}
`
}

function patchLayoutFonts(fonts: ThemeSavePayload['customFonts']) {
  const layoutPath = path.join(process.cwd(), srcRoot(), 'app/layout.tsx')
  let src = fs.readFileSync(layoutPath, 'utf8')

  const lines = fonts.map((f) => {
    if (f.source === 'google') {
      return `// --font-${f.id}: Google "${f.googleFamily}" (loaded via tokens/fonts.css @import)`
    }
    return `// --font-${f.id}: file ${f.path ?? f.fileName} (@font-face in tokens/fonts.css)`
  })

  const start = '// THEME_FONTS_START'
  const end = '// THEME_FONTS_END'
  const block = `${start}
${lines.length ? lines.join('\n') : '// (no custom fonts)'}
${end}`

  if (src.includes(start) && src.includes(end)) {
    src = src.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block)
  } else {
    src = src.replace(/from 'next\/font\/google'\n/, `from 'next/font/google'\n\n${block}\n`)
  }

  fs.writeFileSync(layoutPath, src)
}

function writeIconMap(iconMap: Record<string, string>) {
  const entries = Object.entries(iconMap)
    .map(([k, v]) => `  '${k}': '${v}',`)
    .join('\n')
  const content = `/**
 * Semantic icon keys → Lucide icon component names.
 * Edited from /theme-editor; rewritten by POST /api/theme/save.
 */
export const defaultIconMap = {
${entries}
} as const

export type IconKey = keyof typeof defaultIconMap

/** Mutable map used at runtime (overrides applied before save). */
export let iconMap: Record<string, string> = { ...defaultIconMap }

export function setIconMap(next: Record<string, string>) {
  iconMap = { ...next }
}
`
  fs.writeFileSync(path.join(process.cwd(), srcRoot(), 'components/icons/icon-map.ts'), content)
}

function patchGlobalsColorBridge(customColors: ThemeSavePayload['customColors']) {
  if (!customColors.length) return
  const globalsPath = path.join(process.cwd(), srcRoot(), 'app/globals.css')
  let css = fs.readFileSync(globalsPath, 'utf8')
  const start = '  /* THEME_CUSTOM_COLORS_START */'
  const end = '  /* THEME_CUSTOM_COLORS_END */'
  const lines = customColors
    .map((c) => {
      const n = c.name.replace(/^--/, '')
      return `  --color-${n}: var(--${n});`
    })
    .join('\n')
  const block = `${start}\n${lines}\n${end}`
  if (css.includes(start) && css.includes(end)) {
    css = css.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block)
  } else {
    css = css.replace(/(--color-destructive-950: var\(--destructive-950\);)/, `$1\n\n${block}`)
  }
  fs.writeFileSync(globalsPath, css)
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { ok: false, message: 'Theme save is disabled in production.' },
      { status: 403 }
    )
  }

  let payload: ThemeSavePayload
  try {
    payload = (await request.json()) as ThemeSavePayload
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const root = themeRoot()
  const manifestPath = path.join(root, 'theme.manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    groups: {
      id: string
      file: string
      variables: { id: string; name: string; value: string; occurrence: number }[]
    }[]
  }

  // Persist file fonts
  const fontsDir = path.join(process.cwd(), 'public/fonts')
  fs.mkdirSync(fontsDir, { recursive: true })
  const fonts = [...payload.customFonts]
  for (let i = 0; i < fonts.length; i++) {
    const f = fonts[i]
    if (f.source === 'file' && f.dataUrl) {
      const ext = path.extname(f.fileName) || '.woff2'
      const outName = `${f.id}${ext}`
      const outPath = path.join(fontsDir, outName)
      const base64 = f.dataUrl.replace(/^data:[^;]+;base64,/, '')
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'))
      fonts[i] = { ...f, path: `/fonts/${outName}`, dataUrl: undefined }
    }
  }

  // Update each CSS file's declared variables
  for (const group of manifest.groups) {
    const abs = path.join(process.cwd(), srcRoot(), 'styles', group.file)
    if (!fs.existsSync(abs)) continue
    let css = fs.readFileSync(abs, 'utf8')

    for (const v of group.variables) {
      const next = payload.values[v.id] ?? payload.values[v.name]
      if (next !== undefined) {
        css = replaceCssVarAtOccurrence(css, v.name, next, v.occurrence ?? 0)
      }
    }

    if (group.id === 'colors') {
      for (const c of payload.customColors) {
        css = ensureColorVar(css, c.name, c.hex)
      }
    }

    if (group.id === 'typography') {
      for (const t of payload.customTypography) {
        css = appendTypographyRole(css, t.id, t)
      }
    }

    if (group.id === 'fonts') {
      css = writeFontsCss(css, fonts, payload.values)
    }

    fs.writeFileSync(abs, css)
  }

  patchGlobalsColorBridge(payload.customColors)
  patchLayoutFonts(fonts)
  writeIconMap(payload.iconMap)

  // Regenerate manifest
  try {
    execFileSync('node', ['scripts/generate-theme-manifest.mjs'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    })
  } catch (e) {
    return NextResponse.json({
      ok: true,
      message: `Saved CSS/icons, but manifest regenerate failed: ${e instanceof Error ? e.message : e}`,
    })
  }

  const themeDir = srcRoot() === '.' ? 'styles/theme' : `${srcRoot()}/styles/theme`
  return NextResponse.json({
    ok: true,
    message: `Saved ${Object.keys(payload.values).length} values to ${themeDir}/.`,
  })
}
