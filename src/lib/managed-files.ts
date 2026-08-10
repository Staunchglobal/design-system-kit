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
      // Public (no session) pages live under the (public) route group —
      // its layout.tsx bounces an already-signed-in user to /dashboard.
      'app/(public)/layout.tsx',
      'app/(public)/login/page.tsx',
      'app/(public)/signup/page.tsx',
      'app/(public)/verify-otp/page.tsx',
      'app/(public)/forgot-password/page.tsx',
      'app/(public)/verify-reset-otp/page.tsx',
      'app/(public)/reset-password/page.tsx',
      'app/(public)/accept-invitation/page.tsx',
      // Private (session-required) pages live under the (app) route group,
      // sharing its layout.tsx (auth guard + sidebar app shell) — see
      // VITE_ROUTES above for the matching Vite-side private/public split.
      'app/(app)/layout.tsx',
      'app/(app)/change-password/page.tsx',
      'app/(app)/dashboard/page.tsx',
    ],
    vite: [
      'auth/LoginPage.tsx',
      'auth/SignupPage.tsx',
      'auth/VerifyOtpPage.tsx',
      'auth/ForgotPasswordPage.tsx',
      'auth/VerifyResetOtpPage.tsx',
      'auth/ResetPasswordPage.tsx',
      'auth/AcceptInvitationPage.tsx',
      'auth/ChangePasswordPage.tsx',
      'auth/DashboardPage.tsx',
      'auth/PrivateLayout.tsx',
      'auth/PublicOnlyLayout.tsx',
    ],
  },
  'account-settings': {
    next: ['app/(app)/layout.tsx', 'app/(app)/email-change/page.tsx'],
    vite: ['account-settings/EmailChangePage.tsx', 'auth/PrivateLayout.tsx'],
  },
  chat: {
    next: [
      'app/(app)/layout.tsx',
      'app/(app)/chat/chat-app.tsx',
      'app/(app)/chat/chat-href.ts',
      'app/(app)/chat/page.tsx',
      'app/(app)/chat/[id]/page.tsx',
      'app/(app)/chat/archived/page.tsx',
      'app/(app)/chat/archived/[id]/page.tsx',
    ],
    vite: ['chat/ChatPage.tsx', 'auth/PrivateLayout.tsx'],
  },
  'user-management': {
    next: [
      'app/(app)/layout.tsx',
      'app/(app)/user-management/page.tsx',
      'app/(app)/user-management/[tab]/page.tsx',
    ],
    vite: [
      'user-management/UserManagementPage.tsx',
      'user-management/UserManagementRedirect.tsx',
      'auth/PrivateLayout.tsx',
    ],
  },
  'feature-flags-admin': {
    next: ['app/(app)/layout.tsx', 'app/(app)/feature-flags-admin/page.tsx'],
    vite: ['feature-flags-admin/FeatureFlagsAdminPage.tsx', 'auth/PrivateLayout.tsx'],
  },
  'delivery-logs': {
    next: ['app/(app)/layout.tsx', 'app/(app)/delivery-logs/page.tsx'],
    vite: ['delivery-logs/DeliveryLogsPage.tsx', 'auth/PrivateLayout.tsx'],
  },
  'audit-trail-viewer': {
    next: ['app/(app)/layout.tsx', 'app/(app)/audit-trail-viewer/page.tsx'],
    vite: ['audit-trail-viewer/AuditTrailViewerPage.tsx', 'auth/PrivateLayout.tsx'],
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
  // A Set, not a plain push — the shared app-shell/private-layout files are
  // deliberately listed under more than one slug (auth, chat, account-settings
  // all need them reachable even if only one of the three is selected,
  // matching the existing redundant-copy convention this file already uses
  // for e.g. auth-session.ts inside chat's own EXTRA_FILES), so duplicates
  // across slugs are expected here, not a bug to leave unhandled.
  const out = new Set<string>()
  for (const slug of closure) {
    const entry = FRAMEWORK_EXTRA_FILES[slug]
    if (entry) for (const f of entry[framework]) out.add(f)
  }
  return [...out]
}

export type RouteEntry = {
  path: string
  file: string
  component: string
  /** Requires a signed-in session — wrapped in the private layout (sidebar + auth guard) on both frameworks. */
  private: boolean
  /** Sidebar label — only set on the one canonical path per feature (e.g. not chat's `:id` variants). */
  navLabel?: string
  /** Overrides `path` as the sidebar link's href — needed when `path` itself has a route param (e.g. `/user-management/:tab`) that isn't a real, clickable URL on its own. */
  navHref?: string
  /** Ability key (see `CurrentUser.abilities`) required to see this nav item/page — omit for routes every signed-in user can reach. */
  requiredAbility?: string
}

/**
 * Next gets routing for free from its file-based App Router — every file in
 * FRAMEWORK_EXTRA_FILES[slug].next above already IS a route. Vite has no
 * router at all, so this is the corresponding manifest for the CLI-generated
 * `src/routes.tsx` (see generateRoutesTsx in codegen.ts): which path(s) each
 * Vite page file under FRAMEWORK_EXTRA_FILES[slug].vite should be mounted at.
 * `component` is the default export's name, used for the generated import
 * and JSX — several routes can share one file/component (e.g. chat's four
 * paths all render the same ChatPage, which reads the active tab/id itself
 * via useParams/useLocation, mirroring the Next side's four thin page.tsx
 * wrappers around one ChatApp).
 *
 * `private`/`navLabel` also drive the private-route split and sidebar nav on
 * BOTH frameworks (see AppShell/PrivateLayout — Next's `(app)` route group
 * and Vite's routes.tsx wrap exactly the entries marked `private: true` here).
 */
export const VITE_ROUTES: Record<string, RouteEntry[]> = {
  auth: [
    { path: '/login', file: 'auth/LoginPage', component: 'LoginPage', private: false },
    { path: '/signup', file: 'auth/SignupPage', component: 'SignupPage', private: false },
    { path: '/verify-otp', file: 'auth/VerifyOtpPage', component: 'VerifyOtpPage', private: false },
    {
      path: '/forgot-password',
      file: 'auth/ForgotPasswordPage',
      component: 'ForgotPasswordPage',
      private: false,
    },
    {
      path: '/verify-reset-otp',
      file: 'auth/VerifyResetOtpPage',
      component: 'VerifyResetOtpPage',
      private: false,
    },
    {
      path: '/reset-password',
      file: 'auth/ResetPasswordPage',
      component: 'ResetPasswordPage',
      private: false,
    },
    {
      path: '/accept-invitation',
      file: 'auth/AcceptInvitationPage',
      component: 'AcceptInvitationPage',
      private: false,
    },
    {
      path: '/change-password',
      file: 'auth/ChangePasswordPage',
      component: 'ChangePasswordPage',
      private: true,
    },
    { path: '/dashboard', file: 'auth/DashboardPage', component: 'DashboardPage', private: true, navLabel: 'Account' },
  ],
  'account-settings': [
    {
      path: '/email-change',
      file: 'account-settings/EmailChangePage',
      component: 'EmailChangePage',
      private: true,
      navLabel: 'Email settings',
      requiredAbility: 'account_settings:access',
    },
  ],
  chat: [
    {
      path: '/chat',
      file: 'chat/ChatPage',
      component: 'ChatPage',
      private: true,
      navLabel: 'Chat',
      requiredAbility: 'chat:access',
    },
    { path: '/chat/:id', file: 'chat/ChatPage', component: 'ChatPage', private: true },
    { path: '/chat/archived', file: 'chat/ChatPage', component: 'ChatPage', private: true },
    { path: '/chat/archived/:id', file: 'chat/ChatPage', component: 'ChatPage', private: true },
  ],
  'user-management': [
    {
      // Tabs (All/Active/Archived/Pending) are separate routes, not client
      // state — one dynamic segment covers all four, read via useParams().
      path: '/user-management/:tab',
      file: 'user-management/UserManagementPage',
      component: 'UserManagementPage',
      private: true,
      navLabel: 'Users',
      navHref: '/user-management/all',
      requiredAbility: 'users:view',
    },
    {
      // Old bare-path bookmark/link fallback — redirects to the "all" tab.
      path: '/user-management',
      file: 'user-management/UserManagementRedirect',
      component: 'UserManagementRedirect',
      private: true,
    },
  ],
  'feature-flags-admin': [
    {
      path: '/feature-flags-admin',
      file: 'feature-flags-admin/FeatureFlagsAdminPage',
      component: 'FeatureFlagsAdminPage',
      private: true,
      navLabel: 'Feature Flags',
      requiredAbility: 'feature_flags:manage',
    },
  ],
  'delivery-logs': [
    {
      path: '/delivery-logs',
      file: 'delivery-logs/DeliveryLogsPage',
      component: 'DeliveryLogsPage',
      private: true,
      navLabel: 'Delivery Logs',
      requiredAbility: 'delivery_logs:view',
    },
  ],
  'audit-trail-viewer': [
    {
      path: '/audit-trail-viewer',
      file: 'audit-trail-viewer/AuditTrailViewerPage',
      component: 'AuditTrailViewerPage',
      private: true,
      navLabel: 'Audit Trail',
      requiredAbility: 'audit_trail:view',
    },
  ],
}

export function viteRoutesFor(closure: Iterable<string>): RouteEntry[] {
  const out: RouteEntry[] = []
  for (const slug of closure) {
    const entry = VITE_ROUTES[slug]
    if (entry) out.push(...entry)
  }
  return out
}

/** Sidebar nav items for the signed-in app shell — shared by both frameworks (Next's `(app)/_nav.ts` and Vite's routes.tsx both derive from this). */
export function privateNavItemsFor(
  closure: Iterable<string>
): { label: string; href: string; requiredAbility?: string }[] {
  return viteRoutesFor(closure)
    .filter((r) => r.private && r.navLabel)
    .map((r) => ({ label: r.navLabel!, href: r.navHref ?? r.path, requiredAbility: r.requiredAbility }))
}
