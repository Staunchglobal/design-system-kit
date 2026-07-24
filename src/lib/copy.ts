import fs from 'node:fs'
import path from 'node:path'
import { fetchRequiredTemplateText, fetchTemplateText, mapWithConcurrency, remoteUrl } from './remote.js'
import { applyRenameHistory, type RenameHistoryEntry } from './rename-history.js'

export type CopyResult = {
  copied: string[]
  skipped: string[]
  /** Content fetched for every path in `copied`/`skipped`, keyed by relPath — populated once
   *  here so callers that also need it (hashEntriesFor) never issue a second fetch for it. */
  contents: Map<string, string>
}

export async function copyTemplateFile(
  srcUrl: string,
  destFile: string,
  dryRun = false,
  renameHistory: RenameHistoryEntry[] = []
): Promise<'copied' | 'skipped'> {
  if (fs.existsSync(destFile)) return 'skipped'
  let content = await fetchRequiredTemplateText(srcUrl)
  if (renameHistory.length) content = applyRenameHistory(destFile, content, renameHistory)
  if (!dryRun) {
    fs.mkdirSync(path.dirname(destFile), { recursive: true })
    fs.writeFileSync(destFile, content)
  }
  return 'copied'
}

/**
 * Fetches and copies only the given relative paths (used for selective installs).
 * Never overwrites an existing file — those are reported back as `skipped` so the
 * caller can tell the user what wasn't touched (their own edits are never at risk).
 * A path that 404s at `srcBase` (removed/renamed in a newer template version) is
 * silently omitted from both lists, matching the old `fs.existsSync(src)` guard.
 * `dryRun: true` computes the exact same copied/skipped classification without
 * writing anything — used by `init --dry-run` to preview what would happen.
 */
export async function copySelectedFiles(
  srcBase: string,
  destDir: string,
  relativePaths: Iterable<string>,
  dryRun = false,
  renameHistory: RenameHistoryEntry[] = []
): Promise<CopyResult> {
  const copied: string[] = []
  const skipped: string[] = []
  const contents = new Map<string, string>()

  await mapWithConcurrency([...relativePaths], 8, async (rel) => {
    let content = await fetchTemplateText(remoteUrl(srcBase, rel))
    if (content === null) return
    if (renameHistory.length) content = applyRenameHistory(rel, content, renameHistory)
    contents.set(rel, content)
    const dest = path.join(destDir, rel)
    if (fs.existsSync(dest)) {
      skipped.push(rel)
      return
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.writeFileSync(dest, content)
    }
    copied.push(rel)
  })

  return { copied, skipped, contents }
}

export function writeGeneratedFile(destFile: string, content: string, dryRun = false): void {
  if (dryRun) return
  fs.mkdirSync(path.dirname(destFile), { recursive: true })
  fs.writeFileSync(destFile, content)
}

export function hashEntriesFor(result: CopyResult): { destRel: string; templateContent: string; written: boolean }[] {
  const entries: { destRel: string; templateContent: string; written: boolean }[] = []
  for (const rel of result.copied) {
    entries.push({ destRel: rel, templateContent: result.contents.get(rel)!, written: true })
  }
  for (const rel of result.skipped) {
    entries.push({ destRel: rel, templateContent: result.contents.get(rel)!, written: false })
  }
  return entries
}
