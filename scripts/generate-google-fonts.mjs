#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outPath = path.join(root, 'template-shared/src/lib/theme/google-fonts.ts')

const res = await fetch('https://fonts.google.com/metadata/fonts')
if (!res.ok) {
  throw new Error(`Failed to fetch Google Fonts metadata: ${res.status} ${res.statusText}`)
}
const data = await res.json()

const list = data.familyMetadataList
  .map((f) => {
    const weights = new Set()
    for (const key of Object.keys(f.fonts ?? {})) {
      const m = key.match(/^(\d+)i?$/)
      if (m) weights.add(Number(m[1]))
    }
    return { family: f.family, weights: [...weights].sort((a, b) => a - b) }
  })
  .filter((f) => f.weights.length > 0)
  .sort((a, b) => a.family.localeCompare(b.family))

const content = `export type GoogleFontEntry = { family: string; weights: number[] }

export const googleFonts: GoogleFontEntry[] = ${JSON.stringify(list)}
`

fs.writeFileSync(outPath, content)
console.log(`Wrote ${list.length} fonts to ${path.relative(root, outPath)}`)
