import path from 'node:path'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import type { ProjectInfo, PackageManager } from '../lib/detect.js'
import {
  ALL_RUNTIME_DEPENDENCIES,
  CORE_RUNTIME_DEPENDENCIES,
  VITE_DEV_DEPENDENCIES,
  VITE_FONT_DEPENDENCIES,
  missingDeps,
  runInstall,
} from '../lib/deps.js'
import { copySelectedFiles, copyTemplateFile, hashEntriesFor } from '../lib/copy.js'
import { patchGlobalsCss } from '../lib/patch-globals-css.js'
import { patchTsconfig } from '../lib/patch-tsconfig.js'
import { logTypeScriptCompat } from '../lib/check-typescript-compat.js'
import { patchViteConfig, VITE_CONFIG_MANUAL_SNIPPET } from '../lib/patch-vite-config.js'
import { patchMainEntry } from '../lib/patch-main-entry.js'
import { confirm } from '../lib/confirm.js'
import { templateSharedDir, templateViteDir, templateRootDir } from '../lib/paths.js'
import { fetchRequiredTemplateText, remoteUrl } from '../lib/remote.js'
import { pickComponents, priorSelectionFor } from '../lib/prompt-components.js'
import {
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  npmDepsFor,
  resolveUiClosure,
} from '../lib/selection.js'
import { writeSelectionConfig, recordFileHashes } from '../lib/selection-state.js'
import { ALWAYS_SHARED_FILES, ALWAYS_VITE_FILES, frameworkExtraFilesFor } from '../lib/managed-files.js'
import { printBundleReport } from '../lib/report.js'
import { regenerateGeneratedFiles } from '../lib/regenerate-generated-files.js'
import type { InitOptions } from './init-next.js'

export async function runViteInit(project: ProjectInfo, pm: PackageManager, options: InitOptions) {
  const root = project.root

  if (!project.hasSrcDir) {
    log.error('No `src/` directory found. This kit expects the standard `create-vite` layout (src/main.tsx, …).')
    process.exitCode = 1
    return
  }

  if (!project.viteConfigPath) {
    log.warn('Could not find vite.config.{ts,js,mts} — the Tailwind plugin wiring will need to be manual.')
  }

  log.title('Components')
  const prior = priorSelectionFor(root)
  const picked = await pickComponents(prior, options)
  const userChosen = new Set([...picked, ...prior])
  const userClosure = resolveUiClosure(userChosen)
  const addedByDeps = new Set([...userClosure].filter((s) => !userChosen.has(s)))
  if (!userClosure.size) {
    log.warn('No components selected — installing just the theme system and design-system shell.')
  } else {
    log.info(`Installing: ${[...userClosure].sort().join(', ')}`)
  }
  if (addedByDeps.size) {
    log.info(`Also included (required by your picks): ${[...addedByDeps].sort().join(', ')}`)
  }

  const existingDeps = {
    ...((project.packageJson.dependencies as Record<string, string>) ?? {}),
    ...((project.packageJson.devDependencies as Record<string, string>) ?? {}),
  }
  const neededRuntime = { ...CORE_RUNTIME_DEPENDENCIES, ...VITE_FONT_DEPENDENCIES }
  for (const dep of npmDepsFor(userClosure)) {
    if (ALL_RUNTIME_DEPENDENCIES[dep]) neededRuntime[dep] = ALL_RUNTIME_DEPENDENCIES[dep]
  }
  const runtimeToInstall = missingDeps(neededRuntime, existingDeps)
  const devToInstall = missingDeps(VITE_DEV_DEPENDENCIES, existingDeps)

  log.title('Dependencies')
  if (!Object.keys(runtimeToInstall).length && !Object.keys(devToInstall).length) {
    log.success('Everything already installed.')
  } else {
    if (Object.keys(runtimeToInstall).length) log.info(`Will install: ${Object.keys(runtimeToInstall).join(', ')}`)
    if (Object.keys(devToInstall).length) log.info(`Will install (dev): ${Object.keys(devToInstall).join(', ')}`)
    if (options.dryRun) {
      log.skip('Skipping install (--dry-run).')
    } else if (options.skipInstall) {
      log.skip('Skipping install (--skip-install).')
    } else if (await confirm('Install these now?', options.yes)) {
      if (Object.keys(runtimeToInstall).length) {
        const res = runInstall(pm, root, runtimeToInstall, false)
        if (!res.ok) {
          log.error(`Dependency install failed: ${res.message}`)
          process.exitCode = 1
          return
        }
      }
      if (Object.keys(devToInstall).length) {
        const res = runInstall(pm, root, devToInstall, true)
        if (!res.ok) {
          log.error(`Dev dependency install failed: ${res.message}`)
          process.exitCode = 1
          return
        }
      }
      log.success('Dependencies installed.')
    } else {
      log.skip('Skipped install — run it yourself before `vite dev`.')
    }
  }

  log.title('Files')
  const uiFiles = [...userClosure].filter((s) => s !== 'patterns').map((s) => `components/ui/${s}.tsx`)
  const extraFiles = [...extraFilesFor(userClosure)]
  const navGroups = navGroupsFor(userClosure)
  const sectionFiles = demoFilesFor(navGroups).map((f) => `design-system/_sections/${f}`)
  const frameworkExtraFiles = frameworkExtraFilesFor(userClosure, 'vite')

  const sharedSrc = remoteUrl(templateSharedDir, 'src')
  const viteSrc = remoteUrl(templateViteDir, 'src')

  if (options.report) {
    await printBundleReport({
      categories: [
        { label: 'Shared fixed files', baseDir: sharedSrc, relPaths: ALWAYS_SHARED_FILES },
        { label: 'UI components', baseDir: sharedSrc, relPaths: uiFiles },
        { label: 'Extra files', baseDir: sharedSrc, relPaths: extraFiles },
        { label: 'Vite fixed files', baseDir: viteSrc, relPaths: ALWAYS_VITE_FILES },
        { label: 'Design-system demo files', baseDir: viteSrc, relPaths: sectionFiles },
        { label: 'Framework feature routes', baseDir: viteSrc, relPaths: frameworkExtraFiles },
      ],
      runtimeDeps: Object.keys(neededRuntime),
      devDeps: Object.keys(VITE_DEV_DEPENDENCIES),
    })
  }

  const dryRun = !!options.dryRun
  const sharedFixed = await copySelectedFiles(sharedSrc, path.join(root, 'src'), ALWAYS_SHARED_FILES, dryRun)
  const sharedUi = await copySelectedFiles(sharedSrc, path.join(root, 'src'), uiFiles, dryRun)
  const sharedExtra = await copySelectedFiles(sharedSrc, path.join(root, 'src'), extraFiles, dryRun)
  const sharedTokens = await copySelectedFiles(
    sharedSrc,
    path.join(root, 'src'),
    [
      'styles/theme/index.css',
      'styles/theme/tokens/color-scales.css',
      'styles/theme/tokens/colors.css',
      'styles/theme/tokens/shadows.css',
      'styles/theme/tokens/radius.css',
      'styles/theme/tokens/fonts.css',
      'styles/theme/tokens/typography.css',
      'styles/theme/tokens/typography-patterns.css',
    ],
    dryRun
  )
  const viteFixed = await copySelectedFiles(viteSrc, path.join(root, 'src'), ALWAYS_VITE_FILES, dryRun)
  const viteSections = await copySelectedFiles(viteSrc, path.join(root, 'src'), sectionFiles, dryRun)
  const viteFrameworkExtra = await copySelectedFiles(viteSrc, path.join(root, 'src'), frameworkExtraFiles, dryRun)

  const copied = [
    sharedFixed,
    sharedUi,
    sharedExtra,
    sharedTokens,
    viteFixed,
    viteSections,
    viteFrameworkExtra,
  ].flatMap((r) => r.copied)
  const skipped = [
    sharedFixed,
    sharedUi,
    sharedExtra,
    sharedTokens,
    viteFixed,
    viteSections,
    viteFrameworkExtra,
  ].flatMap((r) => r.skipped)
  for (const f of copied) log[dryRun ? 'info' : 'success'](dryRun ? `Would copy src/${f}` : `src/${f}`)
  for (const f of skipped) log.skip(`src/${f} (already exists — left untouched)`)

  if (!dryRun) {
    recordFileHashes(root, [
      ...hashEntriesFor(sharedFixed),
      ...hashEntriesFor(sharedUi),
      ...hashEntriesFor(sharedExtra),
      ...hashEntriesFor(sharedTokens),
      ...hashEntriesFor(viteFixed),
      ...hashEntriesFor(viteSections),
      ...hashEntriesFor(viteFrameworkExtra),
    ])
  }

  const componentsJsonResult = await copyTemplateFile(
    remoteUrl(templateViteDir, 'components.json'),
    path.join(root, 'components.json'),
    dryRun
  )
  log[componentsJsonResult === 'copied' ? 'success' : 'skip'](
    componentsJsonResult === 'copied'
      ? `${dryRun ? 'Would copy' : ''} components.json`.trim()
      : 'components.json (already exists — left untouched)'
  )

  regenerateGeneratedFiles({
    destRoot: path.join(root, 'src'),
    framework: 'vite',
    navGroups,
    closure: userClosure,
    dryRun,
  })

  if (dryRun) {
    log.title('Wiring it up')
    log.skip('Skipping config patches (index.css, vite.config.ts, tsconfig.json, main entry) — --dry-run')
    log.title('Done')
    log.info('Dry run — nothing was written. Re-run without --dry-run to actually install.')
    return
  }

  log.title('Wiring it up')

  const cssPath = path.join(root, 'src/index.css')
  const cssTemplate = await fetchRequiredTemplateText(remoteUrl(templateRootDir, 'index.css'))
  const cssResult = patchGlobalsCss(cssPath, cssTemplate)
  switch (cssResult.action) {
    case 'created':
      log.success('Created src/index.css')
      break
    case 'replaced-stock':
      log.success('Replaced the default index.css with the theme-wired version')
      break
    case 'patched':
      if (cssResult.addedThemeBlock) {
        log.success(
          "Patched src/index.css: added the Tailwind imports and the full @theme block (Tailwind wasn't set up in this project yet) — your existing styles are kept"
        )
      } else if (cssResult.addedImports.length || cssResult.addedOther.length) {
        log.success('Patched src/index.css with the missing @import/@plugin lines (your existing styles are kept)')
      } else {
        log.skip('src/index.css already wired up')
      }
      break
    case 'needs-manual-merge':
      log.warn(`src/index.css needs a manual merge: ${cssResult.reason}`)
      log.info(`Add this @theme block's contents into your existing one:\n${cssTemplate}`)
      break
  }

  if (project.viteConfigPath) {
    const result = patchViteConfig(project.viteConfigPath)
    if (result.action === 'patched') log.success('Wired Tailwind into vite.config.ts')
    else if (result.action === 'already-present') log.skip('vite.config.ts already wired up')
    else {
      log.warn(`Couldn't auto-wire vite.config.ts (${result.reason})`)
      log.info(`Merge this in by hand:\n${VITE_CONFIG_MANUAL_SNIPPET}`)
    }
  }

  const mainEntryResult = patchMainEntry(project.mainEntryPath, 'index.css')
  if (mainEntryResult === 'added-import') log.success(`Added the CSS import to ${path.basename(project.mainEntryPath!)}`)
  else if (mainEntryResult === 'already-present') log.skip('Entry file already imports the CSS')
  else log.warn('Could not find src/main.tsx — import "./index.css" from your entry file by hand.')

  const tsconfigResult = patchTsconfig(project.tsconfigPath)
  if (tsconfigResult === 'added-alias')
    log.success(`Added "@/*" path alias to ${path.basename(project.tsconfigPath)}`)
  else if (tsconfigResult === 'already-present')
    log.skip(`${path.basename(project.tsconfigPath)} already has the "@/*" alias`)
  else if (tsconfigResult === 'created') log.success('Created tsconfig.json')
  else log.warn(`Could not parse ${path.basename(project.tsconfigPath)} — add "@/*": ["./src/*"] by hand`)

  logTypeScriptCompat(project.tsconfigPath, project.typeScriptVersion, existingDeps)

  const includeTooltip = userClosure.has('tooltip')
  const includeToaster = userClosure.has('sonner')
  const hasPageRoutes =
    userClosure.has('auth') ||
    userClosure.has('chat') ||
    userClosure.has('account-settings') ||
    userClosure.has('user-management') ||
    userClosure.has('feature-flags-admin') ||
    userClosure.has('delivery-logs') ||
    userClosure.has('audit-trail-viewer')
  log.title('Manual step: mount the pages')
  const providerLines: string[] = []
  if (includeTooltip || includeToaster) {
    if (includeTooltip) providerLines.push(`  import { TooltipProvider } from '@/components/ui/tooltip'`)
    if (includeToaster) providerLines.push(`  import { Toaster } from '@/components/ui/sonner'`)
    providerLines.push('  …')
    providerLines.push(includeTooltip ? '  <TooltipProvider>' : '  <>')
    providerLines.push('    <App />')
    providerLines.push(includeTooltip ? '  </TooltipProvider>' : '  </>')
    if (includeToaster) providerLines.push('  <Toaster />')
  }
  log.info(
    'Vite has no built-in router, so wire these up yourself — e.g. with react-router-dom:\n' +
      `  import { BrowserRouter, Route, Routes } from 'react-router-dom'\n` +
      `  import DesignSystemPage from '@/design-system/DesignSystemPage'\n` +
      (hasPageRoutes ? `  import { AppRoutes } from '@/routes'\n` : '') +
      '  …\n' +
      '  <BrowserRouter>\n' +
      '    <Routes>\n' +
      '      <Route path="/design-system" element={<DesignSystemPage />} />\n' +
      '    </Routes>\n' +
      (hasPageRoutes
        ? '    {/* auth/chat/account-settings/user-management routes are already generated — mount them alongside the above: */}\n' +
          '    <AppRoutes />\n'
        : '') +
      '  </BrowserRouter>' +
      (providerLines.length
        ? '\n\nAlso wrap your app root once with the tooltip/toast providers:\n' + providerLines.join('\n')
        : '')
  )

  writeSelectionConfig(root, [...userChosen])

  log.title('Done')
  log.success('Design system kit installed.')
  log.info(`Run your dev server, then visit whatever route you mounted ${pc.bold('DesignSystemPage')} at.`)
  if (userClosure.has('chat')) {
    log.info(`Chat inbox: ${pc.bold('/chat')}, ${pc.bold('/chat/:id')}, ${pc.bold('/chat/archived')} (private route — requires a session) — set VITE_GRAPHQL_URL / VITE_GRAPHQL_WS_URL for the real saas_kit Rails backend (falls back to the in-memory mock otherwise)`)
  }
  if (userClosure.has('user-management')) {
    log.info(`User management: ${pc.bold('/user-management')} (private route, admin-only actions gated client-side)`)
  }
  if (userClosure.has('user-management')) {
    log.info(
      `Render ${pc.bold('<ImpersonationStatus endpoint={import.meta.env.VITE_GRAPHQL_URL} />')} (from ${pc.bold("'@/components/user-management/impersonation-status'")}) near the top of your app root so an active impersonation session shows its "stop impersonating" banner — the endpoint prop is required on Vite (no NEXT_PUBLIC_*-style build-time inlining here) or it silently talks to the mock client.`
    )
  }
  if (userClosure.has('notification-center')) {
    log.info(
      `Render ${pc.bold('<NotificationCenter items={...} unreadCount={...} onItemClick={...} onMarkAllRead={...} />')} (from ${pc.bold("'@/components/notification-center/notification-center'")}) wherever your layout wants a bell icon — wire it to ${pc.bold("useNotifications({ graphqlUrl: import.meta.env.VITE_GRAPHQL_URL, graphqlWsUrl: import.meta.env.VITE_GRAPHQL_WS_URL })")} (same import path) for real data.`
    )
    if (userClosure.has('chat')) {
      log.info(
        `SendMessage raises a "${pc.bold('message_received')}" notification for the other participant automatically — pass a ${pc.bold('describe')} function to ${pc.bold('useNotifications()')} to render its metadata (${pc.bold('sender_name')}, ${pc.bold('preview')}, ${pc.bold('chat_id')}) as real copy instead of the default humanized type.`
      )
    }
  }
  if (userClosure.has('feature-flags-admin')) {
    log.info(`Feature flags: ${pc.bold('/feature-flags-admin')} (private route, role × feature matrix)`)
  }
  if (userClosure.has('delivery-logs')) {
    log.info(`Delivery logs: ${pc.bold('/delivery-logs')} (private route, read-only email/SMS history)`)
  }
  if (userClosure.has('audit-trail-viewer')) {
    log.info(`Audit trail: ${pc.bold('/audit-trail-viewer')} (private route, read-only change history)`)
  }
  log.info(`Run \`${pc.bold('design-kit init')}\` again any time to add more components.`)
  if (skipped.length) {
    log.warn(`${skipped.length} file(s) already existed and were left untouched — see the list above.`)
  }
}
