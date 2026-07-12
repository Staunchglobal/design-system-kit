#!/usr/bin/env node
/**
 * Regenerates template-shared/src/lib/theme/google-fonts.ts from Google's public font
 * metadata endpoint (the same one fonts.google.com itself uses — no API key needed, unlike
 * the official Web Fonts Developer API). Run manually when the catalog needs refreshing;
 * the output is committed as a static file, not fetched at CLI runtime, so consumer installs
 * never need network access to the endpoint or an API key of their own.
 *
 * Usage: node scripts/generate-google-fonts.mjs
 */
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

const content = `/**
 * Google Fonts catalog (family name -> available static weights), generated from
 * https://fonts.google.com/metadata/fonts by scripts/generate-google-fonts.mjs.
 * Regenerate with \`node scripts/generate-google-fonts.mjs\` — not auto-run by \`build\`,
 * since it depends on a network call this repo's build shouldn't require.
 */
export type GoogleFontEntry = { family: string; weights: number[] }

export const googleFonts: GoogleFontEntry[] = ${JSON.stringify(list)}
`

fs.writeFileSync(outPath, content)
console.log(`Wrote ${list.length} fonts to ${path.relative(root, outPath)}`)
