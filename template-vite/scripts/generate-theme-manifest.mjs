#!/usr/bin/env node
/**
 * Regenerates <src?>/styles/theme/theme.manifest.json from split CSS files.
 * Usage: node scripts/generate-theme-manifest.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
// Works whether the project uses a src/ directory or not (Next.js supports both).
const srcDir = fs.existsSync(path.join(root, 'src')) ? 'src' : '.'
const themeRoot = path.join(root, srcDir, 'styles/theme')

const COLOR_SEMANTIC = new Set([
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'overlay-bg',
])

const SHADE_PREFIXES = ['neutral-', 'primary-', 'secondary-', 'accent-', 'muted-', 'destructive-']

function inferType(name, value) {
  const v = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return 'hex'
  const m = v.match(/^var\((--[a-zA-Z0-9_-]+)\)$/)
  if (m) {
    const ref = m[1].replace(/^--/, '')
    if (ref.startsWith('radius') || ref.startsWith('theme-radius')) return 'radius-ref'
    if (ref.startsWith('font-') || ref.startsWith('font')) return 'font-ref'
    if (ref.startsWith('typography-')) return 'typography-ref'
    if (SHADE_PREFIXES.some((p) => ref.startsWith(p)) || COLOR_SEMANTIC.has(ref)) return 'color-ref'
    return 'raw'
  }
  return 'raw'
}

/** Infer a short scope label from CSS text before the match. */
function inferScope(css, index) {
  const before = css.slice(0, index)
  const lastEditor = before.lastIndexOf('[data-theme-editor]')
  const lastDark = before.lastIndexOf('.dark')
  const lastRoot = before.lastIndexOf(':root')
  const slotMatch = [...before.matchAll(/\[data-slot=['"]([^'"]+)['"]\]/g)].pop()
  const variantMatch = [...before.matchAll(/\[data-variant=['"]([^'"]+)['"]\]/g)].pop()
  const sizeMatch = [...before.matchAll(/\[data-size=['"]([^'"]+)['"]\]/g)].pop()
  const parts = []
  // Nearest block wins — editor light lock must not be tagged as dark
  // just because `.dark` appears earlier in the file.
  const nearest = Math.max(lastEditor, lastDark, lastRoot)
  if (nearest === lastEditor && lastEditor !== -1) parts.push('editor')
  else if (nearest === lastDark && lastDark !== -1) parts.push('dark')
  else if (lastRoot !== -1) parts.push('root')
  if (slotMatch) parts.push(slotMatch[1])
  if (variantMatch) parts.push(`variant=${variantMatch[1]}`)
  if (sizeMatch) parts.push(`size=${sizeMatch[1]}`)
  return parts.length ? parts.join('/') : 'default'
}

function parseVars(css, groupId) {
  const out = []
  const occurrenceByName = new Map()
  const re = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css))) {
    const name = m[1]
    const value = m[2].replace(/\s+/g, ' ').trim()
    const occurrence = occurrenceByName.get(name) ?? 0
    occurrenceByName.set(name, occurrence + 1)
    const scope = inferScope(css, m.index)
    const id = `${groupId}:${name}:${occurrence}`
    out.push({
      id,
      name,
      value,
      fieldType: inferType(name, value),
      occurrence,
      scope,
    })
  }
  return out
}

function sectionTitle(css, fallback) {
  const m = css.match(/\/\* =+\n\s+([^\n]+)/)
  return m ? m[1].trim() : fallback
}

const groups = []

const tokenFiles = [
  ['colors', 'Colors', 'tokens/colors.css'],
  ['radius', 'Radius', 'tokens/radius.css'],
  ['fonts', 'Fonts', 'tokens/fonts.css'],
  ['typography', 'Typography', 'tokens/typography.css'],
  ['typography-patterns', 'Typography Patterns', 'tokens/typography-patterns.css'],
]

for (const [id, title, rel] of tokenFiles) {
  const css = fs.readFileSync(path.join(themeRoot, rel), 'utf8')
  groups.push({
    id,
    title,
    kind: 'token',
    file: `theme/${rel}`,
    variables: parseVars(css, id),
  })
}

const compDir = path.join(themeRoot, 'components')
for (const name of fs
  .readdirSync(compDir)
  .filter((f) => f.endsWith('.css'))
  .sort()) {
  const css = fs.readFileSync(path.join(compDir, name), 'utf8')
  const id = name.replace(/\.css$/, '')
  groups.push({
    id,
    title: sectionTitle(css, id),
    kind: 'component',
    file: `theme/components/${name}`,
    variables: parseVars(css, id),
  })
}

const manifest = { version: 1, groups }
fs.writeFileSync(
  path.join(themeRoot, 'theme.manifest.json'),
  JSON.stringify(manifest, null, 2) + '\n'
)
console.log(
  `Wrote theme.manifest.json (${groups.length} groups, ${groups.reduce((n, g) => n + g.variables.length, 0)} vars)`
)
