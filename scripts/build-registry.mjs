#!/usr/bin/env node
/**
 * Derives src/generated/registry.ts from the bundled templates:
 * - NAV_GROUPS (template-next design-system nav.ts) for slug -> label, and its own
 *   _sections/<slug>.tsx demo file (one file per component, since scripts/split-sections.mjs)
 * - each ui/*.tsx file's cross-component + npm imports for uiDeps/npmDeps
 * - patterns.tsx's imports for the "patterns" pseudo-component
 * - each demo file's `from './_shared/xxx'` imports for extraDemoFiles (the shared helper file
 *   it needs copied alongside it)
 *
 * Run with `npm run build:registry` whenever the templates change.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const uiDir = path.join(root, 'template-shared/src/components/ui')
const navPath = path.join(root, 'template-next/src/app/design-system/_lib/nav.ts')
const sectionsDir = path.join(root, 'template-next/src/app/design-system/_sections')

const NPM_PACKAGES = [
  '@base-ui/react',
  '@shadcn/react',
  '@tanstack/react-table',
  'class-variance-authority',
  'clsx',
  'cmdk',
  'date-fns',
  'embla-carousel-react',
  'input-otp',
  'lucide-react',
  'radix-ui',
  'react-day-picker',
  'react-resizable-panels',
  'recharts',
  'shadcn',
  'sonner',
  'tailwind-merge',
  'tw-animate-css',
  'vaul',
]

// Files not named after their own component (component slug -> css filename).
const CSS_FILE_OVERRIDES = { sonner: 'sonner-toast.css' }
// Components with no dedicated theme CSS file (pure logic/utility, nothing to theme).
const NO_CSS = new Set(['direction'])
// Extra non-ui files a component's runtime needs.
const EXTRA_FILES = { sidebar: ['hooks/use-mobile.ts'] }

function parseNavGroups(src) {
  const groups = []
  const groupRe = /\{\s*title:\s*'([^']+)',\s*items:\s*\[([\s\S]*?)\]\s*,?\s*\}/g
  let gm
  while ((gm = groupRe.exec(src))) {
    const [, title, itemsBlock] = gm
    const items = []
    const itemRe = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g
    let im
    while ((im = itemRe.exec(itemsBlock))) items.push({ id: im[1], label: im[2] })
    groups.push({ title, items })
  }
  return groups
}

function fileDeps(file) {
  const src = fs.readFileSync(file, 'utf8')
  const uiDeps = new Set()
  for (const m of src.matchAll(/from '@\/components\/ui\/([a-z-]+)'/g)) uiDeps.add(m[1])
  const npmDeps = new Set()
  for (const pkg of NPM_PACKAGES) {
    const re = new RegExp(`from '${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|')`)
    if (re.test(src)) npmDeps.add(pkg)
  }
  return { uiDeps: [...uiDeps], npmDeps: [...npmDeps] }
}

const navSrc = fs.readFileSync(navPath, 'utf8')
const navGroups = parseNavGroups(navSrc)

// Every nav item slug maps 1:1 to its own _sections/<slug>.tsx demo file (split-sections.mjs
// guarantees this). Verify both directions so drift (a renamed nav id, a stray leftover file)
// fails the build loudly instead of silently shipping a broken import.
{
  const allSlugs = new Set(navGroups.flatMap((g) => g.items.map((i) => i.id)))
  const missing = [...allSlugs].filter((slug) => !fs.existsSync(path.join(sectionsDir, `${slug}.tsx`)))
  if (missing.length) {
    throw new Error(`nav.ts references slugs with no matching _sections/*.tsx file: ${missing.join(', ')}`)
  }
  const sectionFiles = fs.readdirSync(sectionsDir).filter((f) => f.endsWith('.tsx'))
  const orphaned = sectionFiles.filter((f) => !allSlugs.has(f.replace(/\.tsx$/, '')))
  if (orphaned.length) {
    throw new Error(`_sections/*.tsx files with no matching nav.ts entry: ${orphaned.join(', ')}`)
  }
}

/** `./_shared/xxx` imports inside a demo file -> the `_shared/xxx.tsx` files it needs alongside it. */
function extraDemoFilesFor(slug) {
  const src = fs.readFileSync(path.join(sectionsDir, `${slug}.tsx`), 'utf8')
  const files = []
  for (const m of src.matchAll(/from '\.\/_shared\/([\w-]+)'/g)) {
    const file = `_shared/${m[1]}.tsx`
    if (!fs.existsSync(path.join(sectionsDir, file))) {
      throw new Error(`${slug}.tsx imports './_shared/${m[1]}' but ${file} doesn't exist`)
    }
    files.push(file)
  }
  return files
}

const ALWAYS_INCLUDED_GROUPS = new Set(['Colors', 'Typography'])

const components = {}
const uiFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx'))
for (const f of uiFiles) {
  const slug = f.replace(/\.tsx$/, '')
  const { uiDeps, npmDeps } = fileDeps(path.join(uiDir, f))

  // The demo file (and any _shared companions it needs) can reference other ui components
  // purely for illustration — e.g. the table demo renders a Badge for invoice status, the
  // button demo shows a Spinner for a loading state — even though the Table/Button component's
  // own implementation has no such dependency. Those need installing too, or picking just
  // "table" ships a demo that imports a Badge component that was never copied.
  const demoUiDeps = new Set(uiDeps)
  const demoNpmDeps = new Set(npmDeps)
  if (fs.existsSync(path.join(sectionsDir, `${slug}.tsx`))) {
    const demoFiles = [`${slug}.tsx`, ...extraDemoFilesFor(slug)]
    for (const demoFile of demoFiles) {
      const deps = fileDeps(path.join(sectionsDir, demoFile))
      for (const d of deps.uiDeps) if (d !== slug) demoUiDeps.add(d)
      for (const d of deps.npmDeps) demoNpmDeps.add(d)
    }
  }

  components[slug] = {
    uiDeps: [...demoUiDeps],
    npmDeps: [...demoNpmDeps],
    cssFile: NO_CSS.has(slug) ? null : (CSS_FILE_OVERRIDES[slug] ?? `${slug}.css`),
    extraFiles: EXTRA_FILES[slug] ?? [],
  }
}

// "patterns" is a pseudo-component (no ui/patterns.tsx) demoed by _sections/patterns.tsx.
const patternsDeps = fileDeps(path.join(sectionsDir, 'patterns.tsx'))
components.patterns = {
  uiDeps: patternsDeps.uiDeps,
  npmDeps: patternsDeps.npmDeps,
  cssFile: null,
  extraFiles: [],
  isPattern: true,
}

const groups = navGroups.map((g) => ({
  title: g.title,
  alwaysIncluded: ALWAYS_INCLUDED_GROUPS.has(g.title),
  items: g.items.map((i) => ({
    slug: i.id,
    label: i.label,
    demoFile: `${i.id}.tsx`,
    extraDemoFiles: extraDemoFilesFor(i.id),
  })),
}))

const out = `// Generated by scripts/build-registry.mjs — do not hand-edit. Re-run \`npm run build:registry\`.
export type ComponentEntry = {
  uiDeps: string[]
  npmDeps: string[]
  cssFile: string | null
  extraFiles: string[]
  isPattern?: boolean
}

export type NavItem = { slug: string; label: string; demoFile: string; extraDemoFiles: string[] }
export type NavGroup = {
  title: string
  alwaysIncluded: boolean
  items: NavItem[]
}

export const COMPONENTS: Record<string, ComponentEntry> = ${JSON.stringify(components, null, 2)}

export const GROUPS: NavGroup[] = ${JSON.stringify(groups, null, 2)}
`

const outPath = path.join(root, 'src/generated/registry.ts')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, out)
console.log(`Wrote ${path.relative(root, outPath)} (${Object.keys(components).length} components, ${groups.length} groups)`)
