import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { Plugin } from 'vite'

type CustomColor = { name: string; hex: string; scope?: 'colors' | 'color-scales' }
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
  // Append inside the file's first :root { — both color-scales.css and colors.css are
  // single-:root files, so there's no further section boundary to insert before.
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
      // Loaded via a <link> in index.html (see patchIndexHtmlFonts), not @import here —
      // this file gets nested-imported into src/index.css, and CSS requires @import to
      // be the first rule in a stylesheet; buried this deep, it never is, and the build
      // fails with "@import rules must precede all rules" for the whole app.
      varLines.push(`  --font-${f.id}: '${f.googleFamily}', sans-serif;`)
    }
  }

  const heading = values['--font-heading'] ?? 'var(--font-sans)'
  return `/* ==========================================================================
   Font Families
   ==========================================================================
   Custom fonts below are managed by the theme editor. \`--font-sans\`/\`--font-mono\`
   are set in src/index.css — point them at whatever font loading you use. Google
   fonts load via a <link> in index.html (see THEME_GOOGLE_FONTS markers there),
   not @import here — see the comment above for why.
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
 * Loads Google fonts via real <link> tags in index.html's <head>, not a CSS @import —
 * see the comment in writeFontsCss for why @import can't work here.
 */
function patchIndexHtmlFonts(root: string, fonts: CustomFont[]) {
  const indexHtmlPath = path.join(root, 'index.html')
  if (!fs.existsSync(indexHtmlPath)) return
  let html = fs.readFileSync(indexHtmlPath, 'utf8')

  const googleFonts = fonts.filter((f) => f.source === 'google')

  const start = '<!-- THEME_GOOGLE_FONTS_START -->'
  const end = '<!-- THEME_GOOGLE_FONTS_END -->'

  const links: string[] = []
  if (googleFonts.length) {
    links.push('<link rel="preconnect" href="https://fonts.googleapis.com" />')
    links.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />')
    for (const f of googleFonts) {
      const family = encodeURIComponent(f.googleFamily)
      const weights = (f.weights || '400;700').replace(/,/g, ';')
      links.push(
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap" />`
      )
    }
  }

  const block = links.length ? `${start}\n    ${links.join('\n    ')}\n    ${end}` : `${start}\n    ${end}`

  if (html.includes(start) && html.includes(end)) {
    html = html.replace(new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`), block)
  } else {
    const headOpenTag = html.match(/<head\b[^>]*>/)
    if (headOpenTag) {
      const insertAt = headOpenTag.index! + headOpenTag[0].length
      html = html.slice(0, insertAt) + `\n    ${block}` + html.slice(insertAt)
    }
  }

  fs.writeFileSync(indexHtmlPath, html)
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

// This endpoint takes an arbitrary JSON payload from the client and writes it into
// files on disk — including generated .ts source that gets imported and executed,
// and font ids that become filesystem paths. Editing an existing CSS variable's
// *value* is the theme editor's actual feature and is already scoped inside a
// `property: <value>;` slot, so it's intentionally left free-form; these checks
// cover the identifiers that instead become selectors, property names, filenames,
// or literal source code, where an unescaped value would let a request break out
// of its intended syntactic slot.
export const SAFE_TOKEN_RE = /^[a-zA-Z0-9_-]+$/
export const SAFE_ICON_KEY_RE = /^[a-zA-Z][a-zA-Z0-9.-]*$/
export const SAFE_ICON_NAME_RE = /^[A-Za-z][A-Za-z0-9]*$/
export const SAFE_FONT_FAMILY_RE = /^[A-Za-z0-9 ]+$/
export const SAFE_WEIGHTS_RE = /^[0-9,; ]+$/
export const SAFE_HEX_RE = /^#[0-9a-fA-F]{3,8}$/
const SAFE_VAR_REF_RE = /^var\((--[a-zA-Z0-9_-]+)\)$/

/**
 * A custom color's value is a literal hex (added from the Color Scales page), a
 * `var(--token)` reference to an existing scale step, or the literal `transparent` keyword
 * (both added from the Colors page, which lets a new semantic token point at either) — all
 * get written verbatim into a real .css file (see ensureColorVar), so all need the same
 * break-out-of-the-declaration protection as SAFE_HEX_RE, just for their own shape.
 */
export function isSafeCustomColorValue(value: string): boolean {
  if (SAFE_HEX_RE.test(value) || value === 'transparent') return true
  const m = value.match(SAFE_VAR_REF_RE)
  return m !== null && SAFE_TOKEN_RE.test(m[1].replace(/^--/, ''))
}

export function isSafeCustomFont(f: CustomFont): boolean {
  if (!SAFE_TOKEN_RE.test(f.id)) return false
  if (f.source === 'google') return SAFE_FONT_FAMILY_RE.test(f.googleFamily) && SAFE_WEIGHTS_RE.test(f.weights || '')
  return true
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

        // Reject identifiers that would land in a filename, a generated .ts source
        // file, or a CSS selector/property name rather than an already-scoped CSS
        // value — see the comment above isSafeCustomFont for what this is (and
        // isn't) guarding.
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
            const outPath = path.join(fontsDir, outName)
            // Belt-and-suspenders on top of the id charset filter above: refuse to
            // write anywhere the resolved path escapes fontsDir.
            if (!outPath.startsWith(fontsDir + path.sep)) continue
            fs.writeFileSync(outPath, Buffer.from(f.dataUrl.replace(/^data:[^;]+;base64,/, ''), 'base64'))
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

          if (group.id === 'colors' || group.id === 'color-scales') {
            for (const c of payload.customColors) {
              if ((c.scope ?? 'colors') !== group.id) continue
              css = ensureColorVar(css, c.name, c.hex)
            }
          }
          if (group.id === 'typography') {
            for (const t of payload.customTypography) css = appendTypographyRole(css, t.id, t)
          }
          if (group.id === 'fonts') css = writeFontsCss(fonts, payload.values)

          fs.writeFileSync(abs, css)
        }

        patchIndexCssColorBridge(root, payload.customColors)
        patchIndexHtmlFonts(root, fonts)
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
