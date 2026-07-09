import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { Plugin } from 'vite'

type CustomColor = { name: string; hex: string }
type CustomTypography = {
  id: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
}
type CustomFont =
  | { id: string; source: 'google'; googleFamily: string; weights: string }
  | { id: string; source: 'file'; fileName: string; dataUrl?: string; path?: string }
type ThemeSavePayload = {
  values: Record<string, string>
  customColors: CustomColor[]
  customTypography: CustomTypography[]
  customFonts: CustomFont[]
  iconMap: Record<string, string>
}

function replaceCssVarAtOccurrence(
  css: string,
  name: string,
  value: string,
  occurrence: number
): string {
  const re = new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`, 'g')
  let matchIndex = 0
  return css.replace(re, (full, prefix, _old, suffix) => {
    if (matchIndex++ === occurrence) return `${prefix}${value}${suffix}`
    return full
  })
}

function ensureColorVar(css: string, name: string, hex: string): string {
  const varName = name.startsWith('--') ? name : `--${name}`
  if (css.includes(`${varName}:`)) {
    return css.replace(
      new RegExp(`(${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*)([^;]+)(;)`),
      `$1${hex}$3`
    )
  }
  const marker = '  /* Semantic tokens'
  if (css.includes(marker)) return css.replace(marker, `  ${varName}: ${hex};\n\n${marker}`)
  return css.replace(/:root\s*\{/, `:root {\n  ${varName}: ${hex};`)
}

function appendTypographyRole(css: string, id: string, t: CustomTypography): string {
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

function writeFontsCss(fonts: CustomFont[], values: Record<string, string>): string {
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
      faceBlocks.push(
        `@font-face {\n  font-family: '${f.id}';\n  src: url('${f.path}') format('${format}');\n  font-display: swap;\n}`
      )
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
   Custom fonts below are managed by the theme editor. \`--font-sans\`/\`--font-mono\`
   are set in src/index.css — point them at whatever font loading you use.
   ========================================================================== */

${googleImports.join('\n')}
${faceBlocks.join('\n\n')}
:root {
  --font-heading: ${heading};
${varLines.join('\n')}
}
`
}

function writeIconMap(root: string, iconMap: Record<string, string>) {
  const entries = Object.entries(iconMap)
    .map(([k, v]) => `  '${k}': '${v}',`)
    .join('\n')
  const content = `/**
 * Semantic icon keys → Lucide icon component names.
 * Edited from the theme editor; rewritten by the design-kit Vite plugin.
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
  fs.writeFileSync(path.join(root, 'src/components/icons/icon-map.ts'), content)
}

function patchIndexCssColorBridge(root: string, customColors: CustomColor[]) {
  if (!customColors.length) return
  const indexCssPath = path.join(root, 'src/index.css')
  if (!fs.existsSync(indexCssPath)) return
  let css = fs.readFileSync(indexCssPath, 'utf8')
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
  fs.writeFileSync(indexCssPath, css)
}

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/**
 * Vite dev-server plugin that gives the /theme-editor's Save button somewhere to write to
 * (the equivalent of the Next.js kit's `/api/theme/save` route handler). Only wired up by
 * `configureServer`, so it never ships in a production build.
 */
export function designKit(): Plugin {
  return {
    name: 'design-kit-theme-save',
    configureServer(server) {
      server.middlewares.use('/api/theme/save', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const root = process.cwd()
        let payload: ThemeSavePayload
        try {
          payload = JSON.parse(await readBody(req))
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, message: 'Invalid JSON' }))
          return
        }

        const themeRoot = path.join(root, 'src/styles/theme')
        const manifestPath = path.join(themeRoot, 'theme.manifest.json')
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
          groups: {
            id: string
            file: string
            variables: { id: string; name: string; value: string; occurrence: number }[]
          }[]
        }

        const fontsDir = path.join(root, 'public/fonts')
        fs.mkdirSync(fontsDir, { recursive: true })
        const fonts = [...payload.customFonts]
        for (let i = 0; i < fonts.length; i++) {
          const f = fonts[i]
          if (f.source === 'file' && f.dataUrl) {
            const ext = path.extname(f.fileName) || '.woff2'
            const outName = `${f.id}${ext}`
            fs.writeFileSync(
              path.join(fontsDir, outName),
              Buffer.from(f.dataUrl.replace(/^data:[^;]+;base64,/, ''), 'base64')
            )
            fonts[i] = { ...f, path: `/fonts/${outName}`, dataUrl: undefined }
          }
        }

        for (const group of manifest.groups) {
          const abs = path.join(root, 'src/styles', group.file)
          if (!fs.existsSync(abs)) continue
          let css = fs.readFileSync(abs, 'utf8')

          for (const v of group.variables) {
            const next = payload.values[v.id] ?? payload.values[v.name]
            if (next !== undefined) {
              css = replaceCssVarAtOccurrence(css, v.name, next, v.occurrence ?? 0)
            }
          }

          if (group.id === 'colors') {
            for (const c of payload.customColors) css = ensureColorVar(css, c.name, c.hex)
          }
          if (group.id === 'typography') {
            for (const t of payload.customTypography) css = appendTypographyRole(css, t.id, t)
          }
          if (group.id === 'fonts') css = writeFontsCss(fonts, payload.values)

          fs.writeFileSync(abs, css)
        }

        patchIndexCssColorBridge(root, payload.customColors)
        writeIconMap(root, payload.iconMap)

        res.setHeader('Content-Type', 'application/json')
        try {
          execFileSync('node', ['scripts/generate-theme-manifest.mjs'], { cwd: root, stdio: 'pipe' })
        } catch (e) {
          res.end(
            JSON.stringify({
              ok: true,
              message: `Saved CSS/icons, but manifest regenerate failed: ${e instanceof Error ? e.message : e}`,
            })
          )
          return
        }

        res.end(
          JSON.stringify({
            ok: true,
            message: `Saved ${Object.keys(payload.values).length} values to src/styles/theme/.`,
          })
        )
      })
    },
  }
}
