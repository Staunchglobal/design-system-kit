import fs from 'node:fs'
import path from 'node:path'

export type CopyResult = {
  copied: string[]
  skipped: string[]
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

/**
 * Copies every file under `srcDir` into `destDir`, preserving relative structure.
 * Never overwrites an existing file — those are reported back as `skipped` so the
 * caller can tell the user what wasn't touched (their own edits are never at risk).
 */
export function copyTemplateDir(srcDir: string, destDir: string): CopyResult {
  const copied: string[] = []
  const skipped: string[] = []

  for (const file of walk(srcDir)) {
    const rel = path.relative(srcDir, file)
    const dest = path.join(destDir, rel)
    if (fs.existsSync(dest)) {
      skipped.push(rel)
      continue
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(file, dest)
    copied.push(rel)
  }

  return { copied, skipped }
}

export function copyTemplateFile(srcFile: string, destFile: string, dryRun = false): 'copied' | 'skipped' {
  if (fs.existsSync(destFile)) return 'skipped'
  if (!dryRun) {
    fs.mkdirSync(path.dirname(destFile), { recursive: true })
    fs.copyFileSync(srcFile, destFile)
  }
  return 'copied'
}

/**
 * Like copyTemplateDir, but only for the given relative paths (used for selective installs).
 * `dryRun: true` computes the exact same copied/skipped classification (by existence checks
 * alone) without writing anything — used by `init --dry-run` to preview what would happen.
 */
export function copySelectedFiles(
  srcDir: string,
  destDir: string,
  relativePaths: Iterable<string>,
  dryRun = false
): CopyResult {
  const copied: string[] = []
  const skipped: string[] = []
  for (const rel of relativePaths) {
    const src = path.join(srcDir, rel)
    if (!fs.existsSync(src)) continue
    const dest = path.join(destDir, rel)
    if (fs.existsSync(dest)) {
      skipped.push(rel)
      continue
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
    }
    copied.push(rel)
  }
  return { copied, skipped }
}

/** Overwrites a file unconditionally — used for CLI-generated files (nav.ts, page.tsx, index.css). */
export function writeGeneratedFile(destFile: string, content: string, dryRun = false): void {
  if (dryRun) return
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.writeFileSync(destFile, content)
}

/** Turns a copySelectedFiles/copyTemplateDir CopyResult into recordFileHashes-ready entries. */
export function hashEntriesFor(
  srcDir: string,
  result: CopyResult
): { destRel: string; templateContent: string; written: boolean }[] {
  const entries: { destRel: string; templateContent: string; written: boolean }[] = []
  for (const rel of result.copied) {
    entries.push({ destRel: rel, templateContent: fs.readFileSync(path.join(srcDir, rel), 'utf8'), written: true })
  }
  for (const rel of result.skipped) {
    entries.push({ destRel: rel, templateContent: fs.readFileSync(path.join(srcDir, rel), 'utf8'), written: false })
  }
  return entries
}
