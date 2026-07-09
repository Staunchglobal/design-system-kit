import fs from 'node:fs'
import path from 'node:path'
import { log } from './log.js'

function sizeOf(baseDir: string, relPaths: Iterable<string>): { count: number; bytes: number } {
  let count = 0
  let bytes = 0
  for (const rel of relPaths) {
    const p = path.join(baseDir, rel)
    if (!fs.existsSync(p)) continue
    count++
    bytes += fs.statSync(p).size
  }
  return { count, bytes }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export type ReportCategory = { label: string; baseDir: string; relPaths: Iterable<string> }

/**
 * Prints a deterministic "how much does this selection add" summary — total source bytes/file
 * counts per category (read straight off the bundled template files, no build/bundler needed)
 * plus the npm package lists. Deliberately doesn't estimate real npm install/node_modules size:
 * that needs either a registry round-trip per package or an actual install, and either would
 * make --report slow or unreliable offline for a number this tool can already answer honestly —
 * "how much source lands in your repo" is the metric that's actually meaningful for a CLI that
 * copies files rather than shipping a bundled library.
 */
export function printBundleReport(opts: {
  categories: ReportCategory[]
  runtimeDeps: string[]
  devDeps: string[]
}): void {
  log.title('Bundle impact report')

  let totalCount = 0
  let totalBytes = 0
  for (const { label, baseDir, relPaths } of opts.categories) {
    const { count, bytes } = sizeOf(baseDir, relPaths)
    if (!count) continue
    totalCount += count
    totalBytes += bytes
    log.info(`${label}: ${count} file(s), ${formatBytes(bytes)}`)
  }
  log.info(`Total source added to your repo: ${totalCount} file(s), ${formatBytes(totalBytes)}`)

  if (opts.runtimeDeps.length) log.info(`npm dependencies: ${opts.runtimeDeps.length} (${opts.runtimeDeps.join(', ')})`)
  if (opts.devDeps.length) log.info(`npm devDependencies: ${opts.devDeps.length} (${opts.devDeps.join(', ')})`)

  log.info(
    "This is source size — what your own bundler (webpack/Turbopack/Rollup) does with it (tree-shaking, minification, code-splitting) determines what actually ships to the browser."
  )
}
