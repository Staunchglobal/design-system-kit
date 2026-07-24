#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process'
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
  assert(
    run('npx', ['--yes', 'create-vite@latest', path.basename(dir), '--template', 'react-ts'], path.dirname(dir), {
      quiet: true,
    }),
    'create-vite failed'
  )
  assert(run('npm', ['install', '--no-audit', '--no-fund'], dir, { quiet: true }), 'vite npm install failed')
}

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
  assert(run('node', [cli, '--templates', root, 'init', '--yes', ...initArgs], dir), 'design-kit init failed')
  assert(run('npm', ['run', 'build'], dir), 'next build failed')
  assert(run('npm', ['run', 'lint'], dir), 'next lint failed')
}

function initAndBuildVite(dir, initArgs) {
  scaffoldVite(dir)
  assert(run('node', [cli, '--templates', root, 'init', '--yes', ...initArgs], dir), 'design-kit init failed')
  mountVitePages(dir)
  assert(run('npm', ['run', 'build'], dir), 'vite build failed')
  assert(run('npm', ['run', 'lint'], dir), 'vite lint failed')
}

async function waitForHttp(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      void 0
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

async function runtimeCheckNext(dir) {
  const port = 30_000 + Math.floor(Math.random() * 10_000)
  const baseUrl = `http://127.0.0.1:${port}`
  const isWindows = process.platform === 'win32'
  const server = spawn('npm', ['run', 'start', '--', '--port', String(port)], {
    cwd: dir,
    stdio: 'pipe',
    shell: isWindows,
    detached: !isWindows,
  })

  try {
    await waitForHttp(`${baseUrl}/design-system`)
    const { chromium } = await import('playwright')
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage()
      const runtimeErrors = []
      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text())
      })
      page.on('pageerror', (error) => runtimeErrors.push(error.message))

      for (const route of ['/design-system', '/theme-editor']) {
        const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
        assert(response?.ok(), `${route} returned HTTP ${response?.status() ?? 'unknown'}`)
      }

      await page.goto(`${baseUrl}/design-system`, { waitUntil: 'networkidle' })
      const cardTitle = page.locator("#card [data-slot='card-title']").first()
      await cardTitle.waitFor()
      const cardTypography = await cardTitle.evaluate((element) => {
        const view = element.ownerDocument.defaultView
        return {
          fontSize: view.getComputedStyle(element).fontSize,
          token: view
            .getComputedStyle(element.ownerDocument.documentElement)
            .getPropertyValue('--typography-h6-font-size')
            .trim(),
        }
      })
      assert(
        cardTypography.fontSize === '24px',
        `CardTitle expected 24px typography token, got ${cardTypography.fontSize} ` +
          `(root --typography-h6-font-size: ${cardTypography.token || 'undefined'})`
      )

      const unfilledRating = page
        .locator("#rating [data-slot='rating-segment']:not([data-filled])")
        .first()
      await unfilledRating.waitFor()
      const ratingLabel = await unfilledRating.getAttribute('aria-label')
      assert(ratingLabel, 'Unfilled Rating segment has no aria-label')
      const ratingTarget = page
        .locator(`#rating [data-slot='rating-segment'][aria-label="${ratingLabel}"]`)
        .first()
      const restingBackground = await ratingTarget.evaluate(
        (element) => element.ownerDocument.defaultView.getComputedStyle(element).backgroundColor
      )
      await ratingTarget.hover()
      await page.waitForTimeout(250)
      const hoverBackground = await ratingTarget.evaluate(
        (element) => element.ownerDocument.defaultView.getComputedStyle(element).backgroundColor
      )
      assert(
        restingBackground !== hoverBackground,
        `Rating hover did not change its background (${restingBackground})`
      )
      assert(runtimeErrors.length === 0, `Browser console/page errors:\n${runtimeErrors.join('\n')}`)
    } finally {
      await browser.close()
    }
  } finally {
    if (isWindows) {
      spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
    } else {
      try {
        process.kill(-server.pid, 'SIGTERM')
      } catch {
        void 0
      }
    }
  }
}

const results = []
async function scenario(name, fn) {
  if (only && !name.toLowerCase().includes(only.toLowerCase())) return
  console.log(`\n=== ${name} ===`)
  const start = Date.now()
  try {
    await fn()
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

const PARTIAL_COMPONENTS = 'button,combobox,dialog,table,accordion,chart,navigation-menu,calendar,item,badge'

await scenario('Next.js — full install (--all)', () => {
  initAndBuildNext(path.join(scratchBase, 'next-all'), ['--all'])
})

await scenario('Next.js — partial selection', () => {
  initAndBuildNext(path.join(scratchBase, 'next-partial'), ['--components', PARTIAL_COMPONENTS])
})

await scenario('Vite — full install (--all)', () => {
  initAndBuildVite(path.join(scratchBase, 'vite-all'), ['--all'])
})

await scenario('Vite — partial selection', () => {
  initAndBuildVite(path.join(scratchBase, 'vite-partial'), ['--components', PARTIAL_COMPONENTS])
})

await scenario('Next.js — runtime pages and interactions', async () => {
  const dir = path.join(scratchBase, 'next-runtime')
  initAndBuildNext(dir, ['--components', 'card,dialog,rating'])
  assert(run('node', [cli, '--templates', root, 'update', '--yes'], dir), 'design-kit update failed')
  assert(run('node', [cli, '--templates', root, 'remove', 'dialog', '--yes'], dir), 'design-kit remove failed')
  assert(run('npm', ['run', 'build'], dir), 'next rebuild after update/remove failed')
  await runtimeCheckNext(dir)
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
