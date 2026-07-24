import fs from 'node:fs'

export type LayoutFontPatchResult =
  | { action: 'patched' }
  | { action: 'already-present' }
  | { action: 'not-needed' }
  | { action: 'needs-manual'; reason: string }

const MANROPE_IMPORT = `import { Manrope, Geist_Mono } from "next/font/google";`

const MANROPE_DECL = `const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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

  if (src.includes('--font-manrope')) {
    return { action: 'already-present' }
  }

  if (
    src.includes('Geist') &&
    src.includes('next/font/google') &&
    (src.includes('--font-geist-sans') || src.includes('geistSans'))
  ) {
    src = src.replace(
      /import\s*\{[^}]*Geist[^}]*\}\s*from\s*["']next\/font\/google["']\s*;?/,
      MANROPE_IMPORT
    )

    src = src.replace(
      /const\s+geistSans\s*=\s*Geist\(\{[\s\S]*?\}\)\s*;?/,
      MANROPE_DECL
    )

    if (!src.includes('Geist_Mono') && src.includes('geistMono')) {
      src = src.replace(
        /const\s+geistMono\s*=\s*Geist_Mono\(\{[\s\S]*?\}\)\s*;?/,
        GEIST_MONO_DECL
      )
    }

    src = src.replace(/\bgeistSans\.variable\b/g, 'manrope.variable')

    fs.writeFileSync(filePath, src)
    return { action: 'patched' }
  }

  if (!src.includes('next/font/google')) {
    return { action: 'not-needed' }
  }

  return {
    action: 'needs-manual',
    reason:
      'layout.tsx does not use the stock Geist Sans setup — add Manrope via next/font/google with variable `--font-manrope` by hand.',
  }
}
