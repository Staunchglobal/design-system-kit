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
