import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { NextResponse } from 'next/server'
import type { ThemeSavePayload } from '@/lib/theme/types'
import {
  SAFE_ICON_KEY_RE,
  SAFE_ICON_NAME_RE,
  SAFE_TOKEN_RE,
  isSafeCssValue,
  isSafeCustomColorValue,
  isSafeCustomFont,
} from '@/lib/theme/validation'

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
  // Append inside the file's first :root { — both color-scales.css and colors.css are
  // single-:root files, so there's no further section boundary to insert before.
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
      // Loaded via a <link> in layout.tsx (see patchLayoutFonts), not @import here —
      // this file gets nested-imported into globals.css, and CSS requires @import to
      // be the first rule in a stylesheet; buried this deep, it never is, and Next's
      // build fails with "@import rules must precede all rules" for the whole app.
      varLines.push(`  --font-${f.id}: '${f.googleFamily}', sans-serif;`)
    }
  }

  const heading = values['--font-heading'] ?? 'var(--font-sans)'
  return `/* ==========================================================================
   Font Families
   ==========================================================================
   \`--font-sans\` / \`--font-mono\` come from next/font (layout.tsx).
   Custom fonts below are managed by /theme-editor. Google fonts load via a
   <link> in layout.tsx (see THEME_GOOGLE_FONTS markers there), not @import
   here — see the comment above for why.
   ========================================================================== */

${faceBlocks.join('\n\n')}
:root {
  --font-heading: ${heading};
${varLines.join('\n')}
}
`
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Loads Google fonts via real <link> tags in <html>, not a CSS @import — see the
 * comment in writeFontsCss for why @import can't work here. `<html>` is guaranteed
 * to exist in any App Router root layout, so appending as its first children works
 * regardless of how the rest of the file is structured. `rel="preconnect"` links are
 * plain resource hints — React auto-hoists them into <head> from anywhere in the
 * tree. `rel="stylesheet"` is different: without a `precedence` prop, React renders
 * it literally in place rather than hoisting it, and a `<link>` isn't a valid direct
 * child of `<html>` (only `<head>`/`<body>` are), which throws a hydration mismatch —
 * `precedence` is what tells React to treat it as a hoistable resource instead.
 */
function patchLayoutFonts(fonts: ThemeSavePayload['customFonts']) {
  const layoutPath = path.join(process.cwd(), srcRoot(), 'app/layout.tsx')
  let src = fs.readFileSync(layoutPath, 'utf8')

  const googleFonts = fonts.filter((f) => f.source === 'google')

  const start = '{/* THEME_GOOGLE_FONTS_START */}'
  const end = '{/* THEME_GOOGLE_FONTS_END */}'

  const links: string[] = []
  if (googleFonts.length) {
    links.push('<link rel="preconnect" href="https://fonts.googleapis.com" />')
    links.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />')
    for (const f of googleFonts) {
      const family = encodeURIComponent(f.googleFamily)
      const weights = (f.weights || '400;700').replace(/,/g, ';')
      // precedence is required for React 19+ to hoist/dedupe a stylesheet link
      // rendered outside <head> — without it, React renders it literally as a
      // child of <html>, which isn't a valid place for a <link> and throws a
      // hydration mismatch.
      links.push(
        `<link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap" />`
      )
    }
  }

  const block = links.length ? `${start}\n      ${links.join('\n      ')}\n      ${end}` : `${start}\n      ${end}`

  if (src.includes(start) && src.includes(end)) {
    src = src.replace(new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`), block)
  } else {
    const htmlOpenTag = src.match(/<html\b[^>]*>/)
    if (htmlOpenTag) {
      const insertAt = htmlOpenTag.index! + htmlOpenTag[0].length
      src = src.slice(0, insertAt) + `\n      ${block}` + src.slice(insertAt)
    }
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

  // Reject identifiers that would land in a filename, a generated .ts/.tsx source
  // file, or a CSS selector/property name rather than an already-scoped CSS value —
  // see the comment above isSafeCustomFont for what this is (and isn't) guarding.
  payload.customFonts = payload.customFonts.filter(isSafeCustomFont)
  payload.customColors = payload.customColors.filter(
    (c) => SAFE_TOKEN_RE.test(c.name.replace(/^--/, '')) && isSafeCustomColorValue(c.hex)
  )
  payload.customTypography = payload.customTypography.filter((t) =>
    SAFE_TOKEN_RE.test(t.id.replace(/^typography-/, ''))
  )
  payload.iconMap = Object.fromEntries(
    Object.entries(payload.iconMap).filter(
      ([k, v]) => SAFE_ICON_KEY_RE.test(k) && SAFE_ICON_NAME_RE.test(v)
    )
  )
  // Values are intentionally free-form (that's the theme editor's actual feature — any
  // CSS value, not just an allowlisted charset), but every one still lands verbatim at
  // `property: <value>;` inside a real .css file (replaceCssVarAtOccurrence below), so a
  // value containing `;`, `{`, `}`, or `/*` could end that declaration early and splice
  // in new CSS rules. Reject those specifically instead of allowlisting the rest away.
  payload.values = Object.fromEntries(
    Object.entries(payload.values).filter(([, v]) => isSafeCssValue(v))
  )

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
      // Belt-and-suspenders on top of the id charset filter above: refuse to write
      // anywhere the resolved path escapes fontsDir.
      if (!outPath.startsWith(fontsDir + path.sep)) continue
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

    if (group.id === 'colors' || group.id === 'color-scales') {
      for (const c of payload.customColors) {
        if ((c.scope ?? 'colors') !== group.id) continue
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
