import { cdnBaseFor } from './remote.js'

/** Framework-agnostic: ui components, icons, hooks, lib/theme, styles/theme. */
export const templateSharedDir = cdnBaseFor('template-shared')
/** Next.js-only: app/design-system, app/theme-editor, app/api/theme/save, components.json. */
export const templateNextDir = cdnBaseFor('template-next')
/** Vite-only: design-system/theme-editor (no app/ prefix), vite plugin, components.json. */
export const templateViteDir = cdnBaseFor('template-vite')
/** globals.css (Next) / index.css (Vite) — copied or merged into the consumer's CSS entry. */
export const templateRootDir = cdnBaseFor('template-root')
