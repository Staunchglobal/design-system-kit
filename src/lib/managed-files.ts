/**
 * Files installed regardless of component selection — shared between `init` (which copies them)
 * and `update` (which needs the exact same list to know what it's allowed to resync). Centralized
 * here instead of duplicated in init-next.ts/init-vite.ts so the two can never drift apart.
 */
export const ALWAYS_SHARED_FILES = [
  'lib/utils.ts',
  'lib/theme/types.ts',
  'lib/theme/token-families.json',
  'lib/theme/field-types.ts',
  'lib/theme/value-parsers.ts',
  'lib/theme/humanize.ts',
  'lib/theme/descriptions.ts',
  'lib/theme/validation.ts',
  'lib/theme/google-fonts.ts',
  'components/icons/icon.tsx',
  'components/icons/icon-context.tsx',
  'components/icons/icon-map.ts',
  'components/inspector/inspector.tsx',
  'components/inspector/inspector-context.tsx',
  'components/inspector/inspector-toggle.tsx',
  'components/inspector/inspector-overlay.tsx',
  'components/inspector/inspector-panel.tsx',
  'components/inspector/use-element-tracking.ts',
  'components/inspector/style-reader.ts',
  'components/inspector/find-target.ts',
  'components/inspector/use-mounted.ts',
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
  'app/api/theme/rename-token/route.ts',
  'lib/theme/rename-engine.ts',
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

export const FRAMEWORK_EXTRA_FILES: Record<
  string,
  { next: string[]; vite: string[] }
> = {
  auth: {
    next: [
      'app/auth/layout.tsx',
      'app/auth/login/page.tsx',
      'app/auth/signup/page.tsx',
      'app/auth/forgot-password/page.tsx',
      'app/auth/verify-otp/page.tsx',
      'app/auth/reset-password/page.tsx',
      'app/auth/accept-invitation/page.tsx',
      'app/auth/change-password/page.tsx',
      'app/auth/home/page.tsx',
    ],
    vite: [
      'auth/LoginPage.tsx',
      'auth/SignupPage.tsx',
      'auth/ForgotPasswordPage.tsx',
      'auth/VerifyOtpPage.tsx',
      'auth/ResetPasswordPage.tsx',
      'auth/AcceptInvitationPage.tsx',
      'auth/ChangePasswordPage.tsx',
      'auth/AuthHomePage.tsx',
    ],
  },
  'address-autocomplete': {
    next: [
      'app/api/places/autocomplete/route.ts',
      'app/api/places/details/route.ts',
    ],
    vite: [],
  },
}

export function frameworkExtraFilesFor(
  closure: Iterable<string>,
  framework: 'next' | 'vite'
): string[] {
  const out: string[] = []
  for (const slug of closure) {
    const entry = FRAMEWORK_EXTRA_FILES[slug]
    if (entry) out.push(...entry[framework])
  }
  return out
}
