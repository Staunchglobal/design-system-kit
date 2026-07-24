import fs from 'node:fs'
import path from 'node:path'

export type PostcssConfigResult = 'created' | 'already-present' | 'needs-manual'

const TEMPLATE = `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
`

/**
 * Next.js only (Vite uses the @tailwindcss/vite plugin instead — see patch-vite-config.ts).
 * Without this file, `@import 'tailwindcss'` in globals.css is never actually processed by
 * Tailwind — the CSS build either fails outright or silently emits none of the utility classes.
 */
export function patchPostcssConfig(root: string): PostcssConfigResult {
  const existing = ['postcss.config.mjs', 'postcss.config.js', 'postcss.config.ts', 'postcss.config.cjs']
    .map((f) => path.join(root, f))
    .find((f) => fs.existsSync(f))

  if (existing) {
    const content = fs.readFileSync(existing, 'utf8')
    return content.includes('@tailwindcss/postcss') ? 'already-present' : 'needs-manual'
  }

  fs.writeFileSync(path.join(root, 'postcss.config.mjs'), TEMPLATE)
  return 'created'
}
