import path from 'node:path'
import { spawnSync } from 'node:child_process'
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
import { copySelectedFiles, copyTemplateFile, hashEntriesFor, writeGeneratedFile } from '../lib/copy.js'
import { patchGlobalsCss } from '../lib/patch-globals-css.js'
import { patchTsconfig } from '../lib/patch-tsconfig.js'
import { logTypeScriptCompat } from '../lib/check-typescript-compat.js'
import { addPackageJsonScript } from '../lib/patch-package-json.js'
import { patchViteConfig, VITE_CONFIG_MANUAL_SNIPPET } from '../lib/patch-vite-config.js'
import { patchMainEntry } from '../lib/patch-main-entry.js'
import { confirm } from '../lib/confirm.js'
import { templateSharedDir, templateViteDir, templateRootDir } from '../lib/paths.js'
import { fetchRequiredTemplateText, remoteUrl } from '../lib/remote.js'
import { pickComponents, priorSelectionFor } from '../lib/prompt-components.js'
import {
  THEME_EDITOR_REQUIRED_COMPONENTS,
  cssFilesFor,
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  npmDepsFor,
  resolveUiClosure,
} from '../lib/selection.js'
import { writeSelectionConfig, recordFileHashes } from '../lib/selection-state.js'
import { ALWAYS_SHARED_FILES, ALWAYS_VITE_FILES } from '../lib/managed-files.js'
import { printBundleReport } from '../lib/report.js'
import {
  generateDesignSystemPage,
  generateLivePreview,
  generateNavTs,
  generateThemeIndexCss,
} from '../lib/codegen.js'
import type { InitOptions } from './init-next.js'

export async function runViteInit(project: ProjectInfo, pm: PackageManager, options: InitOptions) {
  const root = project.root

  if (!project.hasSrcDir) {
    log.error('No `src/` directory found. This kit expects the standard `create-vite` layout (src/main.tsx, …).')
    process.exitCode = 1
    return
  }

  if (!project.viteConfigPath) {
    log.warn('Could not find vite.config.{ts,js,mts} — the Tailwind/theme-save plugin wiring will need to be manual.')
  }

  // ---- Which components? ------------------------------------------------------
  log.title('Components')
  const toolOnly = resolveUiClosure(THEME_EDITOR_REQUIRED_COMPONENTS)
  const prior = priorSelectionFor(root, toolOnly)
  const picked = await pickComponents(prior, options)
  const userChosen = new Set([...picked, ...prior])
  const userClosure = resolveUiClosure(userChosen)
  const addedByDeps = new Set([...userClosure].filter((s) => !userChosen.has(s)))
  const closure = new Set([...userClosure, ...toolOnly])
  if (!userClosure.size) {
    log.warn('No components selected — installing just the theme system and design-system/theme-editor shell.')
  } else {
    log.info(`Installing: ${[...userClosure].sort().join(', ')}`)
  }
  if (addedByDeps.size) {
    log.info(`Also included (required by your picks): ${[...addedByDeps].sort().join(', ')}`)
  }

  // ---- Dependencies -------------------------------------------------------
  const existingDeps = {
    ...((project.packageJson.dependencies as Record<string, string>) ?? {}),
    ...((project.packageJson.devDependencies as Record<string, string>) ?? {}),
  }
  const neededRuntime = { ...CORE_RUNTIME_DEPENDENCIES, ...VITE_FONT_DEPENDENCIES }
  for (const dep of npmDepsFor(closure)) {
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

  // ---- Copy files -------------------------------------------------------------
  log.title('Files')
  const uiFiles = [...closure].filter((s) => s !== 'patterns').map((s) => `components/ui/${s}.tsx`)
  const cssFiles = [...cssFilesFor(closure)].map((f) => `styles/theme/components/${f}`)
  const extraFiles = [...extraFilesFor(closure)]
  // Only the user's own picks decide what shows up in the design-system showcase — the
  // theme editor's tool-chrome deps (toolOnly) must never drag in an unrelated demo section.
  const navGroups = navGroupsFor(userClosure)
  const sectionFiles = demoFilesFor(navGroups).map((f) => `design-system/_sections/${f}`)

  const sharedSrc = remoteUrl(templateSharedDir, 'src')
  const viteSrc = remoteUrl(templateViteDir, 'src')

  if (options.report) {
    await printBundleReport({
      categories: [
        { label: 'Shared fixed files', baseDir: sharedSrc, relPaths: ALWAYS_SHARED_FILES },
        { label: 'UI components', baseDir: sharedSrc, relPaths: uiFiles },
        { label: 'Theme CSS', baseDir: sharedSrc, relPaths: cssFiles },
        { label: 'Extra files', baseDir: sharedSrc, relPaths: extraFiles },
        { label: 'Vite fixed files', baseDir: viteSrc, relPaths: ALWAYS_VITE_FILES },
        { label: 'Design-system demo files', baseDir: viteSrc, relPaths: sectionFiles },
      ],
      runtimeDeps: Object.keys(neededRuntime),
      devDeps: Object.keys(VITE_DEV_DEPENDENCIES),
    })
  }

  const dryRun = !!options.dryRun
  const sharedFixed = await copySelectedFiles(sharedSrc, path.join(root, 'src'), ALWAYS_SHARED_FILES, dryRun)
  const sharedUi = await copySelectedFiles(sharedSrc, path.join(root, 'src'), uiFiles, dryRun)
  const sharedCss = await copySelectedFiles(sharedSrc, path.join(root, 'src'), cssFiles, dryRun)
  const sharedExtra = await copySelectedFiles(sharedSrc, path.join(root, 'src'), extraFiles, dryRun)
  const sharedTokens = await copySelectedFiles(
    sharedSrc,
    path.join(root, 'src'),
    [
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

  const copied = [sharedFixed, sharedUi, sharedCss, sharedExtra, sharedTokens, viteFixed, viteSections].flatMap(
    (r) => r.copied
  )
  const skipped = [sharedFixed, sharedUi, sharedCss, sharedExtra, sharedTokens, viteFixed, viteSections].flatMap(
    (r) => r.skipped
  )
  for (const f of copied) log[dryRun ? 'info' : 'success'](dryRun ? `Would copy src/${f}` : `src/${f}`)
  for (const f of skipped) log.skip(`src/${f} (already exists — left untouched)`)

  if (!dryRun) {
    recordFileHashes(root, [
      ...hashEntriesFor(sharedFixed),
      ...hashEntriesFor(sharedUi),
      ...hashEntriesFor(sharedCss),
      ...hashEntriesFor(sharedExtra),
      ...hashEntriesFor(sharedTokens),
      ...hashEntriesFor(viteFixed),
      ...hashEntriesFor(viteSections),
    ])
  }

  writeGeneratedFile(path.join(root, 'src/design-system/_lib/nav.ts'), generateNavTs(navGroups), dryRun)
  log.success(`${dryRun ? 'Would generate' : 'Generated'} src/design-system/_lib/nav.ts`)

  writeGeneratedFile(
    path.join(root, 'src/design-system/DesignSystemPage.tsx'),
    generateDesignSystemPage({
      navGroups,
      importBase: '@/design-system',
      sidebarImport: '@/design-system/_components/sidebar-nav',
      withMetadata: false,
    }),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} src/design-system/DesignSystemPage.tsx`)

  writeGeneratedFile(
    path.join(root, 'src/theme-editor/_components/live-preview.tsx'),
    generateLivePreview({
      navGroups,
      designSystemImportBase: '@/design-system',
      themeEditorImportBase: '@/theme-editor',
    }),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} src/theme-editor/_components/live-preview.tsx`)

  writeGeneratedFile(
    path.join(root, 'src/styles/theme/index.css'),
    generateThemeIndexCss([...cssFilesFor(closure)]),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} src/styles/theme/index.css`)

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

  const manifestScriptResult = await copyTemplateFile(
    remoteUrl(templateViteDir, 'scripts/generate-theme-manifest.mjs'),
    path.join(root, 'scripts/generate-theme-manifest.mjs'),
    dryRun
  )
  log[manifestScriptResult === 'copied' ? 'success' : 'skip'](
    manifestScriptResult === 'copied'
      ? `${dryRun ? 'Would copy' : ''} scripts/generate-theme-manifest.mjs`.trim()
      : 'scripts/generate-theme-manifest.mjs (already exists — left untouched)'
  )

  const pluginResult = await copyTemplateFile(
    remoteUrl(templateViteDir, 'vite-plugin-design-kit.ts'),
    path.join(root, 'vite-plugin-design-kit.ts'),
    dryRun
  )
  log[pluginResult === 'copied' ? 'success' : 'skip'](
    pluginResult === 'copied'
      ? `${dryRun ? 'Would copy' : ''} vite-plugin-design-kit.ts`.trim()
      : 'vite-plugin-design-kit.ts (already exists — left untouched)'
  )

  if (dryRun) {
    log.title('Wiring it up')
    log.skip('Skipping config patches (index.css, vite.config.ts, tsconfig.json, main entry) — --dry-run')
    log.title('Done')
    log.info('Dry run — nothing was written. Re-run without --dry-run to actually install.')
    return
  }

  // ---- Patch configs ------------------------------------------------------------
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
    if (result.action === 'patched') log.success('Wired Tailwind + the theme-save plugin into vite.config.ts')
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

  const scriptResult = addPackageJsonScript(
    project.packageJsonPath,
    'theme:manifest',
    'node scripts/generate-theme-manifest.mjs'
  )
  log[scriptResult === 'added' ? 'success' : 'skip'](
    scriptResult === 'added'
      ? 'Added "theme:manifest" script to package.json'
      : 'package.json already has a "theme:manifest" script'
  )

  // ---- Regenerate manifest --------------------------------------------------------
  log.title('Theme manifest')
  const manifestRun = spawnSync('node', ['scripts/generate-theme-manifest.mjs'], {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (manifestRun.status === 0) {
    log.success(manifestRun.stdout.trim() || 'Generated theme.manifest.json')
  } else {
    log.warn(`Could not regenerate theme.manifest.json: ${manifestRun.stderr || manifestRun.error}`)
  }

  // ---- Done ------------------------------------------------------------------------
  const includeTooltip = closure.has('tooltip')
  const includeToaster = closure.has('sonner')
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
      `  import DesignSystemPage from '@/design-system/DesignSystemPage'\n` +
      `  import ThemeEditorPage from '@/theme-editor/ThemeEditorPage'\n` +
      '  …\n' +
      '  <Route path="/design-system" element={<DesignSystemPage />} />\n' +
      '  <Route path="/theme-editor" element={<ThemeEditorPage />} />' +
      (providerLines.length
        ? '\n\nAlso wrap your app root once with the tooltip/toast providers:\n' + providerLines.join('\n')
        : '')
  )

  writeSelectionConfig(root, [...userChosen])

  log.title('Done')
  log.success('Design system kit installed.')
  log.info(`Run your dev server, then visit whatever route you mounted ${pc.bold('DesignSystemPage')}/${pc.bold('ThemeEditorPage')} at.`)
  log.info(`Run \`${pc.bold('design-kit init')}\` again any time to add more components.`)
  if (skipped.length) {
    log.warn(`${skipped.length} file(s) already existed and were left untouched — see the list above.`)
  }
}
