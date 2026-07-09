/**
 * Files installed regardless of component selection — shared between `init` (which copies them)
 * and `update` (which needs the exact same list to know what it's allowed to resync). Centralized
 * here instead of duplicated in init-next.ts/init-vite.ts so the two can never drift apart.
 */
export const ALWAYS_SHARED_FILES = [
  'lib/utils.ts',
  'lib/theme/types.ts',
  'lib/theme/field-types.ts',
  'lib/theme/humanize.ts',
  'lib/theme/descriptions.ts',
  'lib/theme/validation.ts',
  'components/icons/icon.tsx',
  'components/icons/icon-context.tsx',
  'components/icons/icon-map.ts',
]

export const ALWAYS_NEXT_FILES = [
  'app/design-system/_components/sidebar-nav.tsx',
  'app/design-system/_lib/showcase.tsx',
  'app/theme-editor/page.tsx',
  'app/theme-editor/_components/smart-field.tsx',
  'app/theme-editor/_components/theme-editor-shell.tsx',
  'app/theme-editor/_components/theme-nav.tsx',
  'app/theme-editor/_components/variable-form.tsx',
  'app/theme-editor/_lib/theme-editor-context.tsx',
  'app/api/theme/save/route.ts',
]

export const ALWAYS_VITE_FILES = [
  'design-system/_components/sidebar-nav.tsx',
  'design-system/_lib/showcase.tsx',
  'theme-editor/ThemeEditorPage.tsx',
  'theme-editor/_components/smart-field.tsx',
  'theme-editor/_components/theme-editor-shell.tsx',
  'theme-editor/_components/theme-nav.tsx',
  'theme-editor/_components/variable-form.tsx',
  'theme-editor/_lib/theme-editor-context.tsx',
]
