import fs from 'node:fs'

export type LayoutFontPatchResult =
  | { action: 'patched' }
  | { action: 'already-present' }
  | { action: 'not-needed' }
  | { action: 'needs-manual'; reason: string }

const INSTRUMENT_SANS_IMPORT = `import { Instrument_Sans, Geist_Mono } from "next/font/google";`

const INSTRUMENT_SANS_DECL = `const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});`

const GEIST_MONO_DECL = `const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});`

export function patchLayoutFonts(filePath: string): LayoutFontPatchResult {
  if (!fs.existsSync(filePath)) {
    return { action: 'needs-manual', reason: `${filePath} not found.` }
  }

  let src = fs.readFileSync(filePath, 'utf8')

  if (src.includes('--font-instrument-sans')) {
    return { action: 'already-present' }
  }

  if (
    src.includes('Geist') &&
    src.includes('next/font/google') &&
    (src.includes('--font-geist-sans') || src.includes('geistSans'))
  ) {
    src = src.replace(
      /import\s*\{[^}]*Geist[^}]*\}\s*from\s*["']next\/font\/google["']\s*;?/,
      INSTRUMENT_SANS_IMPORT
    )

    src = src.replace(
      /const\s+geistSans\s*=\s*Geist\(\{[\s\S]*?\}\)\s*;?/,
      INSTRUMENT_SANS_DECL
    )

    if (!src.includes('Geist_Mono') && src.includes('geistMono')) {
      src = src.replace(
        /const\s+geistMono\s*=\s*Geist_Mono\(\{[\s\S]*?\}\)\s*;?/,
        GEIST_MONO_DECL
      )
    }

    src = src.replace(/\bgeistSans\.variable\b/g, 'instrumentSans.variable')

    fs.writeFileSync(filePath, src)
    return { action: 'patched' }
  }

  if (!src.includes('next/font/google')) {
    return { action: 'not-needed' }
  }

  return {
    action: 'needs-manual',
    reason:
      'layout.tsx does not use the stock Geist Sans setup — add Instrument Sans via next/font/google with variable `--font-instrument-sans` by hand.',
  }
}
