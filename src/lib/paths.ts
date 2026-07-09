import path from 'node:path'
import { fileURLToPath } from 'node:url'

// This module ends up bundled into dist/cli.js, so import.meta.url always resolves
// there regardless of which source file it was written in — one level up is the
// package root, where the template folders are published.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const packageRoot = path.resolve(__dirname, '..')

/** Framework-agnostic: ui components, icons, hooks, lib/theme, styles/theme. */
export const templateSharedDir = path.join(packageRoot, 'template-shared')
/** Next.js-only: app/design-system, app/theme-editor, app/api/theme/save, components.json. */
export const templateNextDir = path.join(packageRoot, 'template-next')
/** Vite-only: design-system/theme-editor (no app/ prefix), vite plugin, components.json. */
export const templateViteDir = path.join(packageRoot, 'template-vite')
/** globals.css (Next) / index.css (Vite) — copied or merged into the consumer's CSS entry. */
export const templateRootDir = path.join(packageRoot, 'template-root')
