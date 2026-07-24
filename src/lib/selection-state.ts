import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export type SelectionConfig = { components: string[]; fileHashes: Record<string, string> }

function configPath(root: string): string {
  return path.join(root, 'design-kit.json')
}

function readRaw(root: string): SelectionConfig {
  const file = configPath(root)
  if (!fs.existsSync(file)) return { components: [], fileHashes: {} }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return {
      components: Array.isArray(parsed.components) ? parsed.components : [],
      fileHashes:
        parsed.fileHashes && typeof parsed.fileHashes === 'object' ? (parsed.fileHashes as Record<string, string>) : {},
    }
  } catch {
    return { components: [], fileHashes: {} }
  }
}

function writeRaw(root: string, config: SelectionConfig): void {
  const content: SelectionConfig = { components: [...config.components].sort(), fileHashes: config.fileHashes }
  fs.writeFileSync(configPath(root), JSON.stringify(content, null, 2) + '\n')
}

/** The user's own cumulative picks across every `init` run — never includes tool-chrome deps. */
export function readSelectionConfig(root: string): SelectionConfig {
  return readRaw(root)
}

export function writeSelectionConfig(root: string, components: string[]): void {
  const current = readRaw(root)
  writeRaw(root, { components, fileHashes: current.fileHashes })
}

export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Records the *template's* content hash for a managed file, keyed by its path relative to the
 * app source root (e.g. "components/ui/button.tsx" — the same relative path whether the project
 * uses Next's src/ layout, no src/ dir, or Vite's always-src/ layout). This is the baseline
 * `update` later diffs the file's live disk content against, to tell "untouched since we last
 * wrote it" apart from "the user customized this":
 *
 * - `written: true` (this run actually copied/overwrote it) → always (re)record the hash, since
 *   disk now genuinely matches this exact template content.
 * - `written: false` (already existed, left alone) → only backfill a baseline if none exists yet
 *   (e.g. installed by a CLI version before this feature existed) — never overwrite an existing
 *   baseline for a file we didn't touch, or a file that's merely outdated-but-unmodified would
 *   get its baseline silently bumped to a newer template without disk ever being rewritten to
 *   match, making `update` wrongly think the user customized it.
 */
export function recordFileHashes(
  root: string,
  entries: { destRel: string; templateContent: string; written: boolean }[]
): void {
  const current = readRaw(root)
  for (const { destRel, templateContent, written } of entries) {
    if (written || !(destRel in current.fileHashes)) {
      current.fileHashes[destRel] = hashContent(templateContent)
    }
  }
  writeRaw(root, current)
}
