#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const uiDir = path.join(root, 'template-shared/src/components/ui')
const navPath = path.join(root, 'template-next/src/app/design-system/_lib/nav.ts')
const sectionsDir = path.join(root, 'template-next/src/app/design-system/_sections')
const optionalRuntimeDependencies = JSON.parse(
  fs.readFileSync(path.join(root, 'src/lib/optional-runtime-dependencies.json'), 'utf8')
)

const NPM_PACKAGES = [
  ...Object.keys(optionalRuntimeDependencies),
  'clsx',
  'lucide-react',
  'shadcn',
  'tailwind-merge',
  'tw-animate-css',
]

const EXTRA_FILES = {
  sidebar: ['hooks/use-mobile.ts'],
  'segmented-control': ['hooks/use-mobile.ts'],
  'crud-table': [
    'hooks/use-mobile.ts',
    'components/crud/types.ts',
    'components/crud/use-debounced-value.ts',
    'components/crud/use-crud-list.ts',
    'components/crud/crud-form-dialog.tsx',
    'components/crud/crud-form-fields.tsx',
    'components/crud/crud-entity-form-dialog.tsx',
    'components/crud/crud-delete-dialog.tsx',
    'components/crud/crud-pagination.tsx',
    'components/crud/crud-toolbar.tsx',
    'components/crud/crud-screen.tsx',
    'components/crud/graphql-client.ts',
  ],
  auth: [
    'components/auth/types.ts',
    'components/auth/auth-operations.ts',
    'components/auth/auth-mock-client.ts',
    'components/auth/auth-session.ts',
    'components/auth/password-policy.ts',
    'components/auth/password-requirement-errors.tsx',
    'components/auth/use-auth-store.ts',
    'components/auth/use-otp-timer.ts',
    'components/auth/otp-timer-storage.ts',
    'components/auth/graphql-client.ts',
    'components/auth/auth-fetch.ts',
    'components/auth/notify.ts',
    'components/auth/password-input.tsx',
    'components/auth/auth-back-link.tsx',
    'components/auth/auth-form-error.tsx',
    'components/auth/auth-submit-button.tsx',
    'components/auth/otp-field.tsx',
    'components/auth/use-current-user.ts',
    'components/auth/auth-shell.tsx',
    'components/auth/login-form.tsx',
    'components/auth/signup-form.tsx',
    'components/auth/forgot-password-form.tsx',
    'components/auth/verify-otp-form.tsx',
    'components/auth/set-password-form.tsx',
    'components/auth/change-password-form.tsx',
    'components/auth/app-shell.tsx',
    'components/auth/index.ts',
  ],
  'account-settings': [
    'components/account-settings/account-settings-operations.ts',
    'components/account-settings/account-settings-mock-client.ts',
    'components/account-settings/account-settings-fetch.ts',
    'components/account-settings/email-change-storage.ts',
    'components/account-settings/use-email-change.ts',
    'components/account-settings/request-email-change-form.tsx',
    'components/account-settings/email-change-settings.tsx',
    'components/account-settings/index.ts',
    'components/auth/app-shell.tsx',
  ],
  chat: [
    'components/chat/types.ts',
    'components/chat/chat-constants.ts',
    'components/chat/chat-operations.ts',
    'components/chat/chat-mock-client.ts',
    'components/chat/chat-fetch.ts',
    'components/chat/chat-graphql-upload.ts',
    'components/chat/image-compression.ts',
    'components/chat/chat-subscribe.ts',
    'components/chat/chat-shell.tsx',
    'components/chat/contacts-sidebar.tsx',
    'components/chat/chat-header.tsx',
    'components/chat/chat-empty-selection.tsx',
    'components/chat/chat-empty-state.tsx',
    'components/chat/chat-search-field.tsx',
    'components/chat/chat-attachment-grid.tsx',
    'components/chat/image-lightbox.tsx',
    'components/chat/chat-message-row.tsx',
    'components/chat/chat-messages-pane.tsx',
    'components/chat/chat-composer.tsx',
    'components/chat/add-chat-dialog.tsx',
    'components/chat/archive-chat-dialog.tsx',
    'components/chat/chat-status.tsx',
    'components/chat/chat-utils.ts',
    'components/chat/chat-mappers.ts',
    'components/chat/use-chat-inbox.ts',
    'components/chat/chat-inbox.tsx',
    'components/chat/index.ts',
    'components/auth/auth-session.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/app-shell.tsx',
    'components/auth/cable-connection.ts',
  ],
  'user-management': [
    'components/user-management/types.ts',
    'components/user-management/user-management-operations.ts',
    'components/user-management/user-management-mock-client.ts',
    'components/user-management/user-management-fetch.ts',
    'components/user-management/decode-jwt.ts',
    'components/user-management/roles-dialog.tsx',
    'components/user-management/grants-dialog.tsx',
    'components/user-management/impersonation-status.tsx',
    'components/user-management/user-management-screen.tsx',
    'components/user-management/index.ts',
    'components/auth/types.ts',
    'components/auth/auth-session.ts',
    'components/auth/auth-operations.ts',
    'components/auth/auth-mock-client.ts',
    'components/auth/auth-fetch.ts',
    'components/auth/use-current-user.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/app-shell.tsx',
    'hooks/use-mobile.ts',
    'components/crud/types.ts',
    'components/crud/use-debounced-value.ts',
    'components/crud/use-crud-list.ts',
    'components/crud/crud-form-dialog.tsx',
    'components/crud/crud-form-fields.tsx',
    'components/crud/crud-entity-form-dialog.tsx',
    'components/crud/crud-delete-dialog.tsx',
    'components/crud/crud-pagination.tsx',
    'components/crud/crud-toolbar.tsx',
    'components/crud/crud-screen.tsx',
  ],
  'feature-flags-admin': [
    'components/feature-flags-admin/types.ts',
    'components/feature-flags-admin/feature-flags-admin-operations.ts',
    'components/feature-flags-admin/feature-flags-admin-mock-client.ts',
    'components/feature-flags-admin/feature-flags-admin-fetch.ts',
    'components/feature-flags-admin/feature-flag-matrix.tsx',
    'components/feature-flags-admin/index.ts',
    'components/auth/types.ts',
    'components/auth/auth-session.ts',
    'components/auth/auth-operations.ts',
    'components/auth/auth-mock-client.ts',
    'components/auth/auth-fetch.ts',
    'components/auth/use-current-user.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/app-shell.tsx',
  ],
  'delivery-logs': [
    'components/delivery-logs/types.ts',
    'components/delivery-logs/delivery-logs-operations.ts',
    'components/delivery-logs/delivery-logs-mock-client.ts',
    'components/delivery-logs/delivery-logs-fetch.ts',
    'components/delivery-logs/delivery-logs-screen.tsx',
    'components/delivery-logs/index.ts',
    'hooks/use-mobile.ts',
    'components/crud/types.ts',
    'components/crud/use-debounced-value.ts',
    'components/crud/use-crud-list.ts',
    'components/crud/crud-form-dialog.tsx',
    'components/crud/crud-form-fields.tsx',
    'components/crud/crud-entity-form-dialog.tsx',
    'components/crud/crud-delete-dialog.tsx',
    'components/crud/crud-pagination.tsx',
    'components/crud/crud-toolbar.tsx',
    'components/crud/crud-screen.tsx',
    'components/auth/types.ts',
    'components/auth/auth-session.ts',
    'components/auth/auth-operations.ts',
    'components/auth/auth-mock-client.ts',
    'components/auth/auth-fetch.ts',
    'components/auth/use-current-user.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/app-shell.tsx',
  ],
  'audit-trail-viewer': [
    'components/audit-trail-viewer/types.ts',
    'components/audit-trail-viewer/audit-trail-operations.ts',
    'components/audit-trail-viewer/audit-trail-mock-client.ts',
    'components/audit-trail-viewer/audit-trail-fetch.ts',
    'components/audit-trail-viewer/audit-trail-screen.tsx',
    'components/audit-trail-viewer/index.ts',
    'hooks/use-mobile.ts',
    'components/crud/types.ts',
    'components/crud/use-debounced-value.ts',
    'components/crud/use-crud-list.ts',
    'components/crud/crud-form-dialog.tsx',
    'components/crud/crud-form-fields.tsx',
    'components/crud/crud-entity-form-dialog.tsx',
    'components/crud/crud-delete-dialog.tsx',
    'components/crud/crud-pagination.tsx',
    'components/crud/crud-toolbar.tsx',
    'components/crud/crud-screen.tsx',
    'components/auth/types.ts',
    'components/auth/auth-session.ts',
    'components/auth/auth-operations.ts',
    'components/auth/auth-mock-client.ts',
    'components/auth/auth-fetch.ts',
    'components/auth/use-current-user.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/app-shell.tsx',
  ],
  'password-strength-meter': [
    'components/auth/password-policy.ts',
    'components/auth/password-input.tsx',
  ],
  dropzone: [
    'components/upload/use-file-drop.ts',
    'components/upload/file-preview-card.tsx',
    'components/upload/dropzone.tsx',
    'components/upload/image-crop-dialog.tsx',
  ],
  'payment-method-list': [
    'components/payment-methods/card-brand-icon.tsx',
    'components/payment-methods/payment-method-card.tsx',
    'components/payment-methods/payment-method-list.tsx',
  ],
  'time-range-picker': [
    'components/time-range-picker/generate-time-options.ts',
    'components/time-range-picker/validate-ranges.ts',
    'components/time-range-picker/time-range-picker.tsx',
  ],
  'address-autocomplete': [
    'components/crud/use-debounced-value.ts',
    'components/address-autocomplete/google-places-client.ts',
    'components/address-autocomplete/address-autocomplete.tsx',
  ],
  'notification-center': [
    'components/notification-center/notification-list.tsx',
    'components/notification-center/notification-center.tsx',
    'components/notification-center/notification-operations.ts',
    'components/notification-center/notification-mappers.ts',
    'components/notification-center/notification-mock-client.ts',
    'components/notification-center/notification-fetch.ts',
    'components/notification-center/notification-subscribe.ts',
    'components/notification-center/use-notifications.ts',
    'components/notification-center/index.ts',
    'components/auth/auth-session.ts',
    'components/auth/graphql-client.ts',
    'components/auth/notify.ts',
    'components/auth/cable-connection.ts',
  ],
  'sortable-list': [
    'components/sortable/sortable-item.tsx',
    'components/sortable/sortable-list.tsx',
  ],
  'stripe-payment-method': [
    'components/stripe/stripe-elements-provider.tsx',
    'components/stripe/payment-method-form.tsx',
    'components/stripe/payment-method-picker.tsx',
  ],
  'pdf-document-kit': [
    'components/pdf/pdf-document-shell.tsx',
    'components/pdf/pdf-tag.tsx',
    'components/pdf/pdf-info-field.tsx',
    'components/pdf/index.ts',
  ],
}

// Packages that ship no bundled .d.ts and have no importable `from '<pkg>'` site of their own
// (types packages are picked up by TS via node_modules/@types, never imported directly) — added
// here since fileDeps()'s import-scan can never detect them.
// `react-router-dom` is only actually imported by the Vite page files under
// FRAMEWORK_EXTRA_FILES (fileDeps() never scans template-vite/template-next,
// only template-shared + the ui/ barrel + the demo section — see below), so
// it's declared here rather than auto-detected. Harmless-but-unused in a
// Next install (Next has its own router); no per-framework npmDeps split
// exists in this registry yet to avoid that.
const EXTRA_NPM_DEPS = {
  chat: ['@types/rails__actioncable', 'react-router-dom'],
  auth: ['react-router-dom'],
  'account-settings': ['react-router-dom'],
  'user-management': ['react-router-dom'],
  'feature-flags-admin': ['react-router-dom'],
  'delivery-logs': ['react-router-dom'],
  'audit-trail-viewer': ['react-router-dom'],
  // Pulls in components/auth/cable-connection.ts (see its EXTRA_FILES
  // entry above), which imports @rails/actioncable directly — that
  // package ships no .d.ts, so a strict-mode consumer's next build fails
  // with TS7016 without this, even though notification-center never
  // installs chat's own npmDeps (they're two independently selectable
  // slugs that happen to share this one file).
  'notification-center': ['@types/rails__actioncable'],
}

function parseNavGroups(src) {
  const groups = []
  const groupRe = /\{\s*title:\s*'([^']+)',\s*items:\s*\[([\s\S]*?)\]\s*,?\s*\}/g
  let gm
  while ((gm = groupRe.exec(src))) {
    const [, title, itemsBlock] = gm
    const items = []
    const itemRe = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g
    let im
    while ((im = itemRe.exec(itemsBlock))) items.push({ id: im[1], label: im[2] })
    groups.push({ title, items })
  }
  return groups
}

function fileDeps(file) {
  const src = fs.readFileSync(file, 'utf8')
  const uiDeps = new Set()
  for (const m of src.matchAll(/from '@\/components\/ui\/([a-z-]+)'/g)) uiDeps.add(m[1])
  const npmDeps = new Set()
  for (const pkg of NPM_PACKAGES) {
    const re = new RegExp(`from '${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|')`)
    if (re.test(src)) npmDeps.add(pkg)
  }
  return { uiDeps: [...uiDeps], npmDeps: [...npmDeps] }
}

const navSrc = fs.readFileSync(navPath, 'utf8')
const navGroups = parseNavGroups(navSrc)

// Every nav item slug maps 1:1 to its own _sections/<slug>.tsx demo file (split-sections.mjs
// guarantees this). Verify both directions so drift (a renamed nav id, a stray leftover file)
// fails the build loudly instead of silently shipping a broken import.
{
  const allSlugs = new Set(navGroups.flatMap((g) => g.items.map((i) => i.id)))
  const missing = [...allSlugs].filter((slug) => !fs.existsSync(path.join(sectionsDir, `${slug}.tsx`)))
  if (missing.length) {
    throw new Error(`nav.ts references slugs with no matching _sections/*.tsx file: ${missing.join(', ')}`)
  }
  const sectionFiles = fs.readdirSync(sectionsDir).filter((f) => f.endsWith('.tsx'))
  const orphaned = sectionFiles.filter((f) => !allSlugs.has(f.replace(/\.tsx$/, '')))
  if (orphaned.length) {
    throw new Error(`_sections/*.tsx files with no matching nav.ts entry: ${orphaned.join(', ')}`)
  }
}

function extraDemoFilesFor(slug) {
  const src = fs.readFileSync(path.join(sectionsDir, `${slug}.tsx`), 'utf8')
  const files = []
  for (const m of src.matchAll(/from '\.\/_shared\/([\w-]+)'/g)) {
    const file = `_shared/${m[1]}.tsx`
    if (!fs.existsSync(path.join(sectionsDir, file))) {
      throw new Error(`${slug}.tsx imports './_shared/${m[1]}' but ${file} doesn't exist`)
    }
    files.push(file)
  }
  return files
}

const ALWAYS_INCLUDED_GROUPS = new Set(['Colors', 'Typography'])

const components = {}
const uiFiles = fs
  .readdirSync(uiDir)
  .filter((f) => f.endsWith('.tsx') && !f.endsWith('.test.tsx') && !f.endsWith('.spec.tsx'))
for (const f of uiFiles) {
  const slug = f.replace(/\.tsx$/, '')
  const { uiDeps, npmDeps } = fileDeps(path.join(uiDir, f))

  // The demo file (and any _shared companions it needs) can reference other ui components
  // purely for illustration — e.g. the table demo renders a Badge for invoice status, the
  // button demo shows a Spinner for a loading state — even though the Table/Button component's
  // own implementation has no such dependency. Those need installing too, or picking just
  // "table" ships a demo that imports a Badge component that was never copied.
  const demoUiDeps = new Set(uiDeps)
  const demoNpmDeps = new Set(npmDeps)

  // EXTRA_FILES (e.g. components/crud/* for crud-table) often hold the real ui/npm imports —
  // scan them too, or dialog/alert-dialog/field never land in uiDeps.
  for (const extra of EXTRA_FILES[slug] ?? []) {
    const extraPath = path.join(root, 'template-shared/src', extra)
    if (!fs.existsSync(extraPath)) {
      throw new Error(`EXTRA_FILES['${slug}'] references missing file: ${extra}`)
    }
    const deps = fileDeps(extraPath)
    for (const d of deps.uiDeps) if (d !== slug) demoUiDeps.add(d)
    for (const d of deps.npmDeps) demoNpmDeps.add(d)
  }

  if (fs.existsSync(path.join(sectionsDir, `${slug}.tsx`))) {
    const demoFiles = [`${slug}.tsx`, ...extraDemoFilesFor(slug)]
    for (const demoFile of demoFiles) {
      const deps = fileDeps(path.join(sectionsDir, demoFile))
      for (const d of deps.uiDeps) if (d !== slug) demoUiDeps.add(d)
      for (const d of deps.npmDeps) demoNpmDeps.add(d)
    }
  }

  for (const dep of EXTRA_NPM_DEPS[slug] ?? []) demoNpmDeps.add(dep)

  components[slug] = {
    uiDeps: [...demoUiDeps],
    npmDeps: [...demoNpmDeps],
    extraFiles: EXTRA_FILES[slug] ?? [],
  }
}

const patternsDeps = fileDeps(path.join(sectionsDir, 'patterns.tsx'))
components.patterns = {
  uiDeps: patternsDeps.uiDeps,
  npmDeps: patternsDeps.npmDeps,
  extraFiles: [],
  isPattern: true,
}

const groups = navGroups.map((g) => ({
  title: g.title,
  alwaysIncluded: ALWAYS_INCLUDED_GROUPS.has(g.title),
  items: g.items.map((i) => ({
    slug: i.id,
    label: i.label,
    demoFile: `${i.id}.tsx`,
    extraDemoFiles: extraDemoFilesFor(i.id),
  })),
}))

const out = `// Generated by scripts/build-registry.mjs — do not hand-edit. Re-run \`npm run build:registry\`.
export type ComponentEntry = {
  uiDeps: string[]
  npmDeps: string[]
  extraFiles: string[]
  isPattern?: boolean
}

export type NavItem = { slug: string; label: string; demoFile: string; extraDemoFiles: string[] }
export type NavGroup = {
  title: string
  alwaysIncluded: boolean
  items: NavItem[]
}

export const COMPONENTS: Record<string, ComponentEntry> = ${JSON.stringify(components, null, 2)}

export const GROUPS: NavGroup[] = ${JSON.stringify(groups, null, 2)}
`

const outPath = path.join(root, 'src/generated/registry.ts')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, out)
console.log(`Wrote ${path.relative(root, outPath)} (${Object.keys(components).length} components, ${groups.length} groups)`)
