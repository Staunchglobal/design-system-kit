import { fetchTemplateSize, mapWithConcurrency, remoteUrl } from './remote.js'
import { log } from './log.js'

async function sizeOf(baseDir: string, relPaths: Iterable<string>): Promise<{ count: number; bytes: number }> {
  let count = 0
  let bytes = 0
  const sizes = await mapWithConcurrency([...relPaths], 8, (rel) => fetchTemplateSize(remoteUrl(baseDir, rel)))
  for (const size of sizes) {
    if (size === null) continue
    count++
    bytes += size
  }
  return { count, bytes }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export type ReportCategory = { label: string; baseDir: string; relPaths: Iterable<string> }

export async function printBundleReport(opts: {
  categories: ReportCategory[]
  runtimeDeps: string[]
  devDeps: string[]
}): Promise<void> {
  log.title('Bundle impact report')

  let totalCount = 0
  let totalBytes = 0
  for (const { label, baseDir, relPaths } of opts.categories) {
    const { count, bytes } = await sizeOf(baseDir, relPaths)
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
