#!/usr/bin/env node
/**
 * End-to-end smoke test: scaffolds real Next.js + Vite apps, runs `design-kit init` against
 * them with a few different component selections, and runs each project's own `build`/`lint`.
 * This is the exact manual loop used throughout development (create-next-app/create-vite → CLI
 * init → framework build → lint) — formalized here so it's a single command instead of retyping
 * a long shell sequence, and so it can be wired into CI.
 *
 * Usage: node scripts/smoke-test.mjs [--keep] [--only next|vite]
 *   --keep         Don't delete the scaffolded scratch projects afterward (for debugging).
 *   --only <fw>    Only run that framework's scenarios.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const keep = args.includes('--keep')
const onlyIdx = args.indexOf('--only')
const only = onlyIdx !== -1 ? args[onlyIdx + 1] : null

const scratchBase = fs.mkdtempSync(path.join(os.tmpdir(), 'design-kit-smoke-'))
console.log(`Scratch dir: ${scratchBase}`)

function run(cmd, cmdArgs, cwd, { quiet = false } = {}) {
  const res = spawnSync(cmd, cmdArgs, {
    cwd,
    stdio: quiet ? 'pipe' : 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })
  return res.status === 0
}

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

const cli = path.join(root, 'dist/cli.js')

function scaffoldNext(dir) {
  assert(
    run(
      'npx',
      [
        '--yes',
        'create-next-app@latest',
        dir,
        '--typescript',
        '--src-dir',
        '--app',
        '--tailwind',
        '--eslint',
        '--use-npm',
        '--import-alias',
        '@/*',
        '--turbopack',
      ],
      scratchBase,
      { quiet: true }
    ),
    'create-next-app failed'
  )
}

function scaffoldVite(dir) {
  // create-vite mishandles an absolute path argument (it re-joins it onto cwd instead of using
  // it as-is) — passing just the basename with cwd set to its parent is the reliable form.
  assert(
    run('npx', ['--yes', 'create-vite@latest', path.basename(dir), '--template', 'react-ts'], path.dirname(dir), {
      quiet: true,
    }),
    'create-vite failed'
  )
  assert(run('npm', ['install', '--no-audit', '--no-fund'], dir, { quiet: true }), 'vite npm install failed')
}

/** Mounts DesignSystemPage/ThemeEditorPage into the stock create-vite App.tsx so `vite build` actually bundles them. */
function mountVitePages(dir) {
  const appPath = path.join(dir, 'src/App.tsx')
  let src = fs.readFileSync(appPath, 'utf8')
  assert(src.includes("import './App.css'"), "App.tsx doesn't look like the stock create-vite template — can't auto-mount")
  src = src.replace(
    "import './App.css'",
    "import './App.css'\nimport DesignSystemPage from './design-system/DesignSystemPage'\nimport ThemeEditorPage from './theme-editor/ThemeEditorPage'"
  )
  src = src.replace('<>', '<>\n      <DesignSystemPage />\n      <ThemeEditorPage />')
  fs.writeFileSync(appPath, src)
}

function initAndBuildNext(dir, initArgs) {
  scaffoldNext(dir)
  assert(run('node', [cli, 'init', '--yes', ...initArgs], dir), 'design-kit init failed')
  assert(run('npm', ['run', 'build'], dir), 'next build failed')
  assert(run('npm', ['run', 'lint'], dir), 'next lint failed')
}

function initAndBuildVite(dir, initArgs) {
  scaffoldVite(dir)
  assert(run('node', [cli, 'init', '--yes', ...initArgs], dir), 'design-kit init failed')
  mountVitePages(dir)
  assert(run('npm', ['run', 'build'], dir), 'vite build failed')
}

const results = []
function scenario(name, fn) {
  if (only && !name.toLowerCase().startsWith(only.toLowerCase())) return
  console.log(`\n=== ${name} ===`)
  const start = Date.now()
  try {
    fn()
    results.push({ name, ok: true, ms: Date.now() - start })
  } catch (err) {
    results.push({ name, ok: false, ms: Date.now() - start, error: err instanceof Error ? err.message : String(err) })
  }
}

console.log('Building the CLI (npm run build) so smoke tests exercise current code...')
if (!run('npm', ['run', 'build'], root)) {
  console.error('npm run build failed — aborting smoke test.')
  process.exit(1)
}

// A partial selection that exercises: cross-category uiDeps (combobox → button/input-group),
// demo-file-only deps (table → badge, button → spinner), body-local state (calendar, item),
// and framework-specific wiring (sonner → Toaster, needs layout/App root changes to fully build,
// so it's deliberately excluded from these fully-automated scenarios — see README's manual-step
// notes for that path).
const PARTIAL_COMPONENTS = 'button,combobox,dialog,table,accordion,chart,navigation-menu,calendar,item,badge'

scenario('Next.js — full install (--all)', () => {
  initAndBuildNext(path.join(scratchBase, 'next-all'), ['--all'])
})

scenario('Next.js — partial selection', () => {
  initAndBuildNext(path.join(scratchBase, 'next-partial'), ['--components', PARTIAL_COMPONENTS])
})

scenario('Vite — full install (--all)', () => {
  initAndBuildVite(path.join(scratchBase, 'vite-all'), ['--all'])
})

scenario('Vite — partial selection', () => {
  initAndBuildVite(path.join(scratchBase, 'vite-partial'), ['--components', PARTIAL_COMPONENTS])
})

console.log('\n\n=== Smoke test summary ===')
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.name} (${Math.round(r.ms / 1000)}s)${r.ok ? '' : ` — ${r.error}`}`)
}

if (keep) {
  console.log(`\nKept scratch dir: ${scratchBase}`)
} else {
  fs.rmSync(scratchBase, { recursive: true, force: true })
}

const failed = results.filter((r) => !r.ok)
if (failed.length) {
  console.error(`\n${failed.length}/${results.length} scenario(s) failed.`)
  process.exit(1)
}
console.log(`\nAll ${results.length} scenario(s) passed.`)
