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
const CSS_VALUE_BREAKOUT_RE = /[;{}]|\/\*/

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

/**
 * A theme variable's value is written verbatim into `property: <value>;` in a real
 * .css file (see replaceCssVarAtOccurrence) — a value containing `;`, `{`, `}`, or a
 * `/*` comment-opener could close that declaration early and splice in new CSS rules.
 */
export function isSafeCssValue(value: string): boolean {
  return !CSS_VALUE_BREAKOUT_RE.test(value)
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

// ============================================================================
// Token rename — mirrors template-shared/src/lib/theme/rename-engine.ts and
// git-guard.ts logic inline, same duplication convention as the save-endpoint
// helpers above (this file is loaded by vite.config.ts outside the app's own
// module graph, so it can't import across that boundary). Reads
// token-families.json via fs (rather than duplicating its data) so the
// reserved-word list can't drift from the canonical registry.
// ============================================================================

export type RenameFamily = 'color' | 'radius' | 'typography' | 'shadow'
type RenameFileChangeKind = 'css' | 'tw-class' | 'data-literal' | 'description'
type RenameFileChange = { path: string; matches: number; kind: RenameFileChangeKind }
type RenamePlan = { changes: RenameFileChange[]; totalMatches: number }
type RenameRequest = { family: RenameFamily; from: string; to: string; mode: 'preview' | 'apply' }

function escapeRegExpRename(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const CLASS_BOUNDARY = `(?=[/"'\`\\s:]|$)`

type Rule = { regex: RegExp; replacement: string | ((...args: string[]) => string) }
type TsxRule = Rule & { kind: RenameFileChangeKind }

function cssRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case 'color':
      return [
        {
          regex: new RegExp(`--${escFrom}(-foreground|-\\d+)?(?![\\w-])`, 'g'),
          replacement: (_m: string, suffix: string) => `--${to}${suffix ?? ''}`,
        },
      ]
    case 'radius':
      return [
        { regex: new RegExp(`--theme-radius-${escFrom}(?![\\w-])`, 'g'), replacement: `--theme-radius-${to}` },
        { regex: new RegExp(`--radius-${escFrom}(?![\\w-])`, 'g'), replacement: `--radius-${to}` },
      ]
    case 'typography':
      return [
        {
          regex: new RegExp(`(\\.)?typography-${escFrom}(?![a-zA-Z0-9])`, 'g'),
          replacement: (_m: string, dot: string) => `${dot ?? ''}typography-${to}`,
        },
      ]
    case 'shadow':
      return [{ regex: new RegExp(`--shadow-${escFrom}(?![\\w-])`, 'g'), replacement: `--shadow-${to}` }]
  }
}

function tsxRulesFor(family: RenameFamily, escFrom: string, to: string): TsxRule[] {
  switch (family) {
    case 'color':
      return [
        {
          kind: 'tw-class',
          regex: new RegExp(
            `\\b(bg|text|border|ring|from|to|via|divide|outline|decoration|caret)-${escFrom}(-foreground)?${CLASS_BOUNDARY}`,
            'g'
          ),
          replacement: (_m: string, prefix: string, fg: string) => `${prefix}-${to}${fg ?? ''}`,
        },
        {
          kind: 'data-literal',
          regex: new RegExp(`(cssVar:\\s*['"\`])--${escFrom}(['"\`])`, 'g'),
          replacement: (_m: string, pre: string, post: string) => `${pre}--${to}${post}`,
        },
        {
          kind: 'data-literal',
          regex: new RegExp(`(prefix:\\s*['"\`])${escFrom}(['"\`])`, 'g'),
          replacement: (_m: string, pre: string, post: string) => `${pre}${to}${post}`,
        },
      ]
    case 'radius':
      return [
        {
          kind: 'tw-class',
          regex: new RegExp(`\\brounded(-[a-z]{1,2})?-${escFrom}${CLASS_BOUNDARY}`, 'g'),
          replacement: (_m: string, dir: string) => `rounded${dir ?? ''}-${to}`,
        },
      ]
    case 'typography':
      return [
        {
          kind: 'tw-class',
          regex: new RegExp(`\\btypography-${escFrom}${CLASS_BOUNDARY}`, 'g'),
          replacement: `typography-${to}`,
        },
      ]
    case 'shadow':
      return [{ kind: 'tw-class', regex: new RegExp(`\\bshadow-${escFrom}${CLASS_BOUNDARY}`, 'g'), replacement: `shadow-${to}` }]
  }
}

function descriptionRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case 'color':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)${escFrom}(-foreground)?\\2:`, 'gm'),
          replacement: (_m: string, indent: string, _q: string, suffix: string) => `${indent}'${to}${suffix ?? ''}':`,
        },
      ]
    case 'radius':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)theme-radius-${escFrom}\\2:`, 'gm'),
          replacement: (_m: string, indent: string) => `${indent}'theme-radius-${to}':`,
        },
      ]
    case 'shadow':
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)shadow-${escFrom}\\2:`, 'gm'),
          replacement: (_m: string, indent: string) => `${indent}'shadow-${to}':`,
        },
      ]
    case 'typography':
      return []
  }
}

function applyRulesRename(content: string, rules: Rule[]): { newContent: string; matches: number } {
  let matches = 0
  let newContent = content
  for (const rule of rules) {
    const found = [...content.matchAll(rule.regex)]
    matches += found.length
    if (found.length) newContent = newContent.replace(rule.regex, rule.replacement as never)
  }
  return { newContent, matches }
}

function cssFilesInRename(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => path.join(dir, f))
}
function tsxFilesInRename(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.tsx')).map((f) => path.join(dir, f))
}

function runRename(req: { family: RenameFamily; from: string; to: string }, root: string, write: boolean): RenamePlan {
  const escFrom = escapeRegExpRename(req.from)
  const changes: RenameFileChange[] = []
  let totalMatches = 0

  const tokensDir = path.join(root, 'src/styles/theme/tokens')
  const componentsDir = path.join(root, 'src/styles/theme/components')
  const bridgeFile = path.join(root, 'src/index.css')
  const uiDir = path.join(root, 'src/components/ui')
  const sectionsDir = path.join(root, 'src/design-system/_sections')
  const descriptionsPath = path.join(root, 'src/lib/theme/descriptions.ts')

  const cssFiles = [...cssFilesInRename(tokensDir), ...cssFilesInRename(componentsDir), ...(fs.existsSync(bridgeFile) ? [bridgeFile] : [])]
  const tsxFiles = [...tsxFilesInRename(uiDir), ...tsxFilesInRename(sectionsDir)]

  for (const filePath of cssFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    const { newContent, matches } = applyRulesRename(content, cssRulesFor(req.family, escFrom, req.to))
    if (matches > 0) {
      changes.push({ path: filePath, matches, kind: 'css' })
      totalMatches += matches
      if (write) fs.writeFileSync(filePath, newContent)
    }
  }

  for (const filePath of tsxFiles) {
    const content = fs.readFileSync(filePath, 'utf8')
    const rules = tsxRulesFor(req.family, escFrom, req.to)
    const byKind = new Map<RenameFileChangeKind, number>()
    let newContent = content
    for (const rule of rules) {
      const found = [...content.matchAll(rule.regex)]
      if (found.length) {
        newContent = newContent.replace(rule.regex, rule.replacement as never)
        byKind.set(rule.kind, (byKind.get(rule.kind) ?? 0) + found.length)
      }
    }
    for (const [kind, matches] of byKind) {
      changes.push({ path: filePath, matches, kind })
      totalMatches += matches
    }
    if (write && newContent !== content) fs.writeFileSync(filePath, newContent)
  }

  if (fs.existsSync(descriptionsPath)) {
    const content = fs.readFileSync(descriptionsPath, 'utf8')
    const { newContent, matches } = applyRulesRename(content, descriptionRulesFor(req.family, escFrom, req.to))
    if (matches > 0) {
      changes.push({ path: descriptionsPath, matches, kind: 'description' })
      totalMatches += matches
      if (write) fs.writeFileSync(descriptionsPath, newContent)
    }
  }

  return { changes, totalMatches }
}

export function isValidRenameTargetInline(family: RenameFamily, from: string, to: string, existingNames: string[], root: string): string | null {
  if (!SAFE_TOKEN_RE.test(to)) return 'Enter a valid identifier — letters, numbers, hyphens, and underscores only.'
  if (to === from) return 'The new name must be different from the current name.'
  const registryPath = path.join(root, 'src/lib/theme/token-families.json')
  const reservedWords = fs.existsSync(registryPath)
    ? (JSON.parse(fs.readFileSync(registryPath, 'utf8')) as { reservedWords: Record<string, string[]> }).reservedWords
    : { color: [], radius: [], typography: [], shadow: [] }
  const reserved = reservedWords[family] ?? []
  if (reserved.includes(to)) return `"${to}" is reserved by Tailwind's own utilities and can't be used here.`
  if (existingNames.includes(to)) return `"${to}" is already used by another token.`
  return null
}

function existingTokenNamesRename(root: string): string[] {
  const manifestPath = path.join(root, 'src/styles/theme/theme.manifest.json')
  if (!fs.existsSync(manifestPath)) return []
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    groups: { variables: { name: string }[] }[]
  }
  const names = new Set<string>()
  for (const g of manifest.groups) for (const v of g.variables) names.add(v.name.replace(/^--/, ''))
  return [...names]
}

/**
 * Records a successful rename so a component added *later* (via `design-kit init`/
 * `update`) can be corrected on the way in instead of arriving with the original name —
 * see the CLI's `src/lib/rename-history.ts`, which reads this same file/shape.
 */
function appendRenameHistoryRename(root: string, entry: { family: RenameFamily; from: string; to: string }): void {
  const historyPath = path.join(root, 'src/lib/theme/token-renames.json')
  let history: { family: RenameFamily; from: string; to: string }[] = []
  if (fs.existsSync(historyPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(historyPath, 'utf8')) as { renames?: typeof history }
      if (Array.isArray(data.renames)) history = data.renames
    } catch {
      history = []
    }
  }
  history.push(entry)
  fs.mkdirSync(path.dirname(historyPath), { recursive: true })
  fs.writeFileSync(historyPath, JSON.stringify({ renames: history }, null, 2) + '\n')
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
        // Values are intentionally free-form (that's the theme editor's actual feature —
        // any CSS value, not just an allowlisted charset), but every one still lands
        // verbatim at `property: <value>;` inside a real .css file
        // (replaceCssVarAtOccurrence below), so a value containing `;`, `{`, `}`, or `/*`
        // could end that declaration early and splice in new CSS rules. Reject those
        // specifically instead of allowlisting the rest away.
        payload.values = Object.fromEntries(
          Object.entries(payload.values).filter(([, v]) => isSafeCssValue(v))
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

      server.middlewares.use('/api/theme/rename-token', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        const root = process.cwd()
        let payload: RenameRequest
        try {
          payload = JSON.parse(await readBody(req))
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: false, message: 'Invalid JSON' }))
          return
        }

        res.setHeader('Content-Type', 'application/json')

        const { family, from, to, mode } = payload
        const validFamilies: RenameFamily[] = ['color', 'radius', 'typography', 'shadow']
        if (
          !validFamilies.includes(family) ||
          typeof from !== 'string' ||
          typeof to !== 'string' ||
          !from ||
          (mode !== 'preview' && mode !== 'apply')
        ) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, message: 'Invalid rename request.', reason: 'invalid' }))
          return
        }

        const validationError = isValidRenameTargetInline(family, from, to, existingTokenNamesRename(root), root)
        if (validationError) {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, message: validationError, reason: 'invalid' }))
          return
        }

        if (mode === 'preview') {
          const plan = runRename({ family, from, to }, root, false)
          if (plan.totalMatches === 0) {
            res.statusCode = 422
            res.end(JSON.stringify({ ok: false, message: `No occurrences of "${from}" found.`, reason: 'no-op' }))
            return
          }
          res.end(
            JSON.stringify({
              ok: true,
              plan,
              message: `Found ${plan.totalMatches} occurrence(s) across ${plan.changes.length} file(s).`,
            })
          )
          return
        }

        // mode === 'apply'
        const plan = runRename({ family, from, to }, root, false)
        if (plan.totalMatches === 0) {
          res.statusCode = 422
          res.end(JSON.stringify({ ok: false, message: `No occurrences of "${from}" found.`, reason: 'no-op' }))
          return
        }

        runRename({ family, from, to }, root, true)
        appendRenameHistoryRename(root, { family, from, to })

        try {
          execFileSync('node', ['scripts/generate-theme-manifest.mjs'], { cwd: root, stdio: 'pipe' })
        } catch (e) {
          res.end(
            JSON.stringify({
              ok: true,
              plan,
              message: `Renamed "${from}" to "${to}", but manifest regenerate failed: ${e instanceof Error ? e.message : e}`,
            })
          )
          return
        }

        const manifestPath = path.join(root, 'src/styles/theme/theme.manifest.json')
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

        res.end(
          JSON.stringify({
            ok: true,
            plan,
            manifest,
            message: `Renamed "${from}" to "${to}" across ${plan.changes.length} file(s).`,
          })
        )
      })

      // Proxies Google's legacy Places REST endpoints — same CORS rationale as the
      // Next.js kit's equivalent /api/places/* route handlers. Dev-only, same as
      // the theme-save/rename-token middleware above.
      server.middlewares.use('/api/places/autocomplete', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const input = url.searchParams.get('input') ?? ''
        const key = url.searchParams.get('key')
        res.setHeader('Content-Type', 'application/json')

        if (!key) {
          res.statusCode = 400
          res.end(JSON.stringify({ status: 'REQUEST_DENIED', error_message: 'Missing API key' }))
          return
        }
        if (!input.trim()) {
          res.end(JSON.stringify({ status: 'ZERO_RESULTS', predictions: [] }))
          return
        }

        const upstream = new URLSearchParams({ input, key, types: 'address' })
        const components = url.searchParams.get('components')
        if (components) upstream.set('components', components)

        const upstreamRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?${upstream.toString()}`
        )
        res.statusCode = upstreamRes.status
        res.end(await upstreamRes.text())
      })

      server.middlewares.use('/api/places/details', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const placeId = url.searchParams.get('place_id') ?? ''
        const key = url.searchParams.get('key')
        res.setHeader('Content-Type', 'application/json')

        if (!key) {
          res.statusCode = 400
          res.end(JSON.stringify({ status: 'REQUEST_DENIED', error_message: 'Missing API key' }))
          return
        }
        if (!placeId) {
          res.statusCode = 400
          res.end(JSON.stringify({ status: 'INVALID_REQUEST', error_message: 'Missing place_id' }))
          return
        }

        const upstream = new URLSearchParams({
          place_id: placeId,
          key,
          fields: 'formatted_address,geometry,address_component',
        })
        const upstreamRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?${upstream.toString()}`
        )
        res.statusCode = upstreamRes.status
        res.end(await upstreamRes.text())
      })
    },
  }
}
