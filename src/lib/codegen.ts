import type { NavGroup } from '../generated/registry.js'

function toPascalCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join('')
}

const TOKEN_IMPORTS = [
  "@import './tokens/color-scales.css';",
  "@import './tokens/colors.css';",
  "@import './tokens/shadows.css';",
  "@import './tokens/radius.css';",
  "@import './tokens/fonts.css';",
  "@import './tokens/typography.css';",
  "@import './tokens/typography-patterns.css';",
]

export function generateThemeIndexCss(cssFiles: string[]): string {
  const componentImports = cssFiles.map((f) => `@import './components/${f}';`)
  return `${[...TOKEN_IMPORTS, ...componentImports].join('\n')}
`
}

export function generateNavTs(groups: NavGroup[]): string {
  const body = groups
    .map(
      (g) =>
        `  {\n    title: '${g.title.replace(/'/g, "\\'")}',\n    items: [${g.items
          .map((i) => `{ id: '${i.slug}', label: '${i.label.replace(/'/g, "\\'")}' }`)
          .join(', ')}],\n  },`
    )
    .join('\n')

  return `export type NavItem = {
  id: string
  label: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
${body}
]
`
}

export function generateDesignSystemPage(opts: {
  navGroups: NavGroup[]
  importBase: string
  sidebarImport: string
  withMetadata: boolean
}): string {
  const { navGroups, importBase, sidebarImport, withMetadata } = opts
  const items = navGroups.flatMap((g) => g.items)
  const imports = items
    .map(
      (item) =>
        `import ${toPascalCase(item.slug)}Demo from '${importBase}/_sections/${item.demoFile.replace(/\.tsx$/, '')}'`
    )
    .join('\n')
  const renders = items.map((item) => `        <${toPascalCase(item.slug)}Demo />`).join('\n')

  const metadataImport = withMetadata ? `import type { Metadata } from 'next'\n\n` : ''
  const metadataBlock = withMetadata
    ? `export const metadata: Metadata = {
  title: 'Design System',
  description: 'Internal reference showing every UI component in every variant and state.',
  robots: {
    index: false,
    follow: false,
  },
}

`
    : ''

  return `${metadataImport}import { SidebarNav } from '${sidebarImport}'
${imports}

${metadataBlock}export default function DesignSystemPage() {
  return (
    <div className="bg-background text-foreground mx-auto flex w-full max-w-[1400px] flex-1 gap-10 px-6 py-10 lg:px-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-10 max-h-[calc(100vh-5rem)] overflow-y-auto pb-10">
          <SidebarNav />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="space-y-2 pb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Design System</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Every shadcn/ui component installed in this app, rendered with its full range of
            variants, sizes, and states for visual QA.
          </p>
        </header>

${renders}
      </main>
    </div>
  )
}
`
}

/**
 * Vite has no file-based router, so this is the CLI-owned equivalent of
 * Next's App Router for whichever page-having slugs (auth/chat/account-
 * settings/...) are in the current selection — see VITE_ROUTES in
 * managed-files.ts for the path/file/component manifest this reads from.
 * Regenerated on every `design-kit init`/`update`/`remove`, same as
 * nav.ts/the design-system page — never hand-edit the output.
 */
type RouteEntry = {
  path: string
  file: string
  component: string
  private: boolean
  navLabel?: string
  navHref?: string
  requiredAbility?: string
}

export function generateRoutesTsx(routes: RouteEntry[]): string {
  const navItems = routes
    .filter((r) => r.private && r.navLabel)
    .map((r) => ({ label: r.navLabel!, href: r.navHref ?? r.path, requiredAbility: r.requiredAbility }))
  const navItemsLiteral = `[${navItems
    .map(
      (n) =>
        `{ label: '${n.label.replace(/'/g, "\\'")}', href: '${n.href}'${n.requiredAbility ? `, requiredAbility: '${n.requiredAbility}'` : ''} }`
    )
    .join(', ')}]`

  if (routes.length === 0) {
    // No react-router-dom import here on purpose — it's only an installed
    // dependency when auth/chat/account-settings is selected (see
    // EXTRA_NPM_DEPS in build-registry.mjs), so an empty selection must not
    // reference it or the build fails with a missing-module error.
    return `// No installed component has any page routes yet — add auth/chat/account-settings
// (or re-run \`design-kit init\`) to populate this file.
export const PRIVATE_NAV_ITEMS: { label: string; href: string; requiredAbility?: string }[] = []

export function AppRoutes() {
  return null
}
`
  }

  const publicRoutes = routes.filter((r) => !r.private)
  const privateRoutes = routes.filter((r) => r.private)

  const byComponent = new Map<string, string>()
  for (const r of routes) byComponent.set(r.component, r.file)

  const imports = [...byComponent.entries()]
    .map(([component, file]) => `import ${component} from '@/${file}'`)
    .join('\n')

  const routeLine = (r: RouteEntry, indent: string) => `${indent}<Route path="${r.path}" element={<${r.component} />} />`

  // Every current public route is a logged-out auth page (login, signup, ...)
  // — wrapping the whole set in PublicOnlyLayout matches the Next side's
  // app/(public)/layout.tsx, which guards this same page set uniformly.
  const publicBlock =
    publicRoutes.length > 0
      ? `      <Route element={<PublicOnlyLayout />}>
${publicRoutes.map((r) => routeLine(r, '        ')).join('\n')}
      </Route>\n`
      : ''
  const privateBlock =
    privateRoutes.length > 0
      ? `      <Route element={<PrivateLayout navItems={PRIVATE_NAV_ITEMS} graphqlUrl={import.meta.env.VITE_GRAPHQL_URL as string | undefined} />}>
${privateRoutes.map((r) => routeLine(r, '        ')).join('\n')}
      </Route>\n`
      : ''

  const publicImport = publicRoutes.length > 0 ? "import PublicOnlyLayout from '@/auth/PublicOnlyLayout'\n" : ''
  const privateImport = privateRoutes.length > 0 ? "import PrivateLayout from '@/auth/PrivateLayout'\n" : ''

  return `import { Route, Routes } from 'react-router-dom'
${privateImport}${publicImport}${imports}

export const PRIVATE_NAV_ITEMS: { label: string; href: string; requiredAbility?: string }[] = ${navItemsLiteral}

/**
 * Mount once at your app's root, inside a <BrowserRouter>:
 *
 *   import { BrowserRouter } from 'react-router-dom'
 *   import { AppRoutes } from '@/routes'
 *
 *   <BrowserRouter><AppRoutes /></BrowserRouter>
 *
 * Routes wrapped by PrivateLayout redirect to /login with no session
 * and render the sidebar app shell (via <Outlet/>) when signed in. Routes
 * wrapped by PublicOnlyLayout redirect to /dashboard when a session already
 * exists, instead of showing the logged-out flow again.
 */
export function AppRoutes() {
  return (
    <Routes>
${publicBlock}${privateBlock}    </Routes>
  )
}
`
}

/**
 * Next-side equivalent of routes.tsx's PRIVATE_NAV_ITEMS export — Next needs
 * no route wiring (file-based routing), just the sidebar nav list, written to
 * `app/(app)/_nav.ts` and imported by the checked-in `(app)/layout.tsx`.
 */
export function generateAppNavTs(navItems: { label: string; href: string; requiredAbility?: string }[]): string {
  const body = navItems
    .map(
      (n) =>
        `  { label: '${n.label.replace(/'/g, "\\'")}', href: '${n.href}'${n.requiredAbility ? `, requiredAbility: '${n.requiredAbility}'` : ''} },`
    )
    .join('\n')

  return `// Generated by the CLI (regenerateGeneratedFiles) from whichever private-page
// slugs are actually installed — see privateNavItemsFor()/VITE_ROUTES in
// src/lib/managed-files.ts. Do not hand-edit; this placeholder is overwritten
// on every \`design-kit init\`/\`update\`/\`remove\`.
export const PRIVATE_NAV_ITEMS: { label: string; href: string; requiredAbility?: string }[] = [
${body}
]
`
}
