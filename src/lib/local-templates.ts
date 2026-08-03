import fs from 'node:fs'
import path from 'node:path'

export function applyLocalTemplatesOption(templatesPath: string | undefined): void {
  if (!templatesPath) return

  const resolved = path.resolve(templatesPath)
  if (!fs.existsSync(resolved)) {
    throw new Error(`--templates path does not exist: ${resolved}`)
  }
  if (!fs.existsSync(path.join(resolved, 'template-shared'))) {
    throw new Error(
      `--templates must point at the design-system-kit repo root (missing template-shared/): ${resolved}`
    )
  }

  process.env.DESIGN_KIT_LOCAL_TEMPLATES = resolved
}
