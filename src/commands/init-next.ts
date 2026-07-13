import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import type { ProjectInfo, PackageManager } from '../lib/detect.js'
import {
  ALL_RUNTIME_DEPENDENCIES,
  CORE_RUNTIME_DEPENDENCIES,
  NEXT_DEV_DEPENDENCIES,
  missingDeps,
  runInstall,
} from '../lib/deps.js'
import { copySelectedFiles, copyTemplateFile, hashEntriesFor, writeGeneratedFile } from '../lib/copy.js'
import { loadRenameHistory } from '../lib/rename-history.js'
import { fetchRequiredTemplateText, remoteUrl } from '../lib/remote.js'
import { patchGlobalsCss } from '../lib/patch-globals-css.js'
import { patchPostcssConfig } from '../lib/patch-postcss-config.js'
import { patchTsconfig } from '../lib/patch-tsconfig.js'
import { logTypeScriptCompat } from '../lib/check-typescript-compat.js'
import { addPackageJsonScript } from '../lib/patch-package-json.js'
import { patchLayout } from '../lib/patch-layout.js'
import { confirm } from '../lib/confirm.js'
import { templateSharedDir, templateNextDir, templateRootDir } from '../lib/paths.js'
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
import { ALWAYS_SHARED_FILES, ALWAYS_NEXT_FILES } from '../lib/managed-files.js'
import { printBundleReport } from '../lib/report.js'
import {
  generateDesignSystemPage,
  generateLivePreview,
  generateNavTs,
  generateThemeIndexCss,
} from '../lib/codegen.js'

export type InitOptions = {
  cwd: string
  pm?: PackageManager
  yes: boolean
  skipInstall: boolean
  all?: boolean
  components?: string
  dryRun?: boolean
  report?: boolean
}

export async function runNextInit(project: ProjectInfo, pm: PackageManager, options: InitOptions) {
  const root = project.root

  if (project.appDirRelative === null) {
    log.error(
      'No App Router directory found (looked for src/app and app). This kit only supports the Next.js App Router.'
    )
    process.exitCode = 1
    return
  }

  // '' for a root layout (no --src-dir), 'src' for the src/ layout — every path below is
  // built from this so the kit works with either.
  const srcDir = project.appDirRelative === 'src/app' ? 'src' : ''
  const destRoot = path.join(root, srcDir)
  const rel = (p: string) => (srcDir ? `${srcDir}/${p}` : p)
  const aliasTarget = srcDir ? './src/*' : './*'
  log.info(`Layout: ${srcDir ? 'src/ directory' : 'no src/ directory (root layout)'}`)

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
  const neededRuntime = { ...CORE_RUNTIME_DEPENDENCIES }
  for (const dep of npmDepsFor(closure)) {
    if (ALL_RUNTIME_DEPENDENCIES[dep]) neededRuntime[dep] = ALL_RUNTIME_DEPENDENCIES[dep]
  }
  const runtimeToInstall = missingDeps(neededRuntime, existingDeps)
  const devToInstall = missingDeps(NEXT_DEV_DEPENDENCIES, existingDeps)

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
      log.skip('Skipped install — run it yourself before `next dev`.')
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
  const sectionFiles = demoFilesFor(navGroups).map((f) => `app/design-system/_sections/${f}`)

  const sharedSrc = remoteUrl(templateSharedDir, 'src')
  const nextSrc = remoteUrl(templateNextDir, 'src')

  if (options.report) {
    await printBundleReport({
      categories: [
        { label: 'Shared fixed files', baseDir: sharedSrc, relPaths: ALWAYS_SHARED_FILES },
        { label: 'UI components', baseDir: sharedSrc, relPaths: uiFiles },
        { label: 'Theme CSS', baseDir: sharedSrc, relPaths: cssFiles },
        { label: 'Extra files', baseDir: sharedSrc, relPaths: extraFiles },
        { label: 'Next.js fixed files', baseDir: nextSrc, relPaths: ALWAYS_NEXT_FILES },
        { label: 'Design-system demo files', baseDir: nextSrc, relPaths: sectionFiles },
      ],
      runtimeDeps: Object.keys(neededRuntime),
      devDeps: Object.keys(NEXT_DEV_DEPENDENCIES),
    })
  }

  const dryRun = !!options.dryRun
  // A previously-renamed token (via /theme-editor) only touched files that existed at
  // the time — reapply that history to anything newly copied now, so a component added
  // after the rename doesn't arrive still using the original name.
  const renameHistory = loadRenameHistory(destRoot)
  const sharedFixed = await copySelectedFiles(sharedSrc, destRoot, ALWAYS_SHARED_FILES, dryRun, renameHistory)
  const sharedUi = await copySelectedFiles(sharedSrc, destRoot, uiFiles, dryRun, renameHistory)
  const sharedCss = await copySelectedFiles(sharedSrc, destRoot, cssFiles, dryRun, renameHistory)
  const sharedExtra = await copySelectedFiles(sharedSrc, destRoot, extraFiles, dryRun, renameHistory)
  const sharedTokens = await copySelectedFiles(
    sharedSrc,
    destRoot,
    [
      'styles/theme/tokens/color-scales.css',
      'styles/theme/tokens/colors.css',
      'styles/theme/tokens/shadows.css',
      'styles/theme/tokens/radius.css',
      'styles/theme/tokens/fonts.css',
      'styles/theme/tokens/typography.css',
      'styles/theme/tokens/typography-patterns.css',
    ],
    dryRun,
    renameHistory
  )
  const nextFixed = await copySelectedFiles(nextSrc, destRoot, ALWAYS_NEXT_FILES, dryRun, renameHistory)
  const nextSections = await copySelectedFiles(nextSrc, destRoot, sectionFiles, dryRun, renameHistory)

  const copied = [sharedFixed, sharedUi, sharedCss, sharedExtra, sharedTokens, nextFixed, nextSections].flatMap(
    (r) => r.copied
  )
  const skipped = [sharedFixed, sharedUi, sharedCss, sharedExtra, sharedTokens, nextFixed, nextSections].flatMap(
    (r) => r.skipped
  )
  for (const f of copied) log[dryRun ? 'info' : 'success'](dryRun ? `Would copy ${rel(f)}` : rel(f))
  for (const f of skipped) log.skip(`${rel(f)} (already exists — left untouched)`)

  if (!dryRun) {
    recordFileHashes(root, [
      ...hashEntriesFor(sharedFixed),
      ...hashEntriesFor(sharedUi),
      ...hashEntriesFor(sharedCss),
      ...hashEntriesFor(sharedExtra),
      ...hashEntriesFor(sharedTokens),
      ...hashEntriesFor(nextFixed),
      ...hashEntriesFor(nextSections),
    ])
  }

  writeGeneratedFile(path.join(destRoot, 'app/design-system/_lib/nav.ts'), generateNavTs(navGroups), dryRun)
  log.success(`${dryRun ? 'Would generate' : 'Generated'} ${rel('app/design-system/_lib/nav.ts')}`)

  writeGeneratedFile(
    path.join(destRoot, 'app/design-system/page.tsx'),
    generateDesignSystemPage({
      navGroups,
      importBase: '@/app/design-system',
      sidebarImport: '@/app/design-system/_components/sidebar-nav',
      withMetadata: true,
    }),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} ${rel('app/design-system/page.tsx')}`)

  writeGeneratedFile(
    path.join(destRoot, 'app/theme-editor/_components/live-preview.tsx'),
    generateLivePreview({
      navGroups,
      designSystemImportBase: '@/app/design-system',
      themeEditorImportBase: '@/app/theme-editor',
    }),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} ${rel('app/theme-editor/_components/live-preview.tsx')}`)

  writeGeneratedFile(
    path.join(destRoot, 'styles/theme/index.css'),
    generateThemeIndexCss([...cssFilesFor(closure)]),
    dryRun
  )
  log.success(`${dryRun ? 'Would generate' : 'Generated'} ${rel('styles/theme/index.css')}`)

  const componentsJsonDest = path.join(root, 'components.json')
  if (fs.existsSync(componentsJsonDest)) {
    log.skip('components.json (already exists — left untouched)')
  } else if (dryRun) {
    log.info('Would create components.json')
  } else {
    const componentsJson = JSON.parse(await fetchRequiredTemplateText(remoteUrl(templateNextDir, 'components.json')))
    componentsJson.tailwind.css = rel('app/globals.css')
    fs.writeFileSync(componentsJsonDest, JSON.stringify(componentsJson, null, 2) + '\n')
    log.success('components.json')
  }

  const manifestScriptResult = await copyTemplateFile(
    remoteUrl(templateNextDir, 'scripts/generate-theme-manifest.mjs'),
    path.join(root, 'scripts/generate-theme-manifest.mjs'),
    dryRun
  )
  log[manifestScriptResult === 'copied' ? 'success' : 'skip'](
    manifestScriptResult === 'copied'
      ? `${dryRun ? 'Would copy' : ''} scripts/generate-theme-manifest.mjs`.trim()
      : 'scripts/generate-theme-manifest.mjs (already exists — left untouched)'
  )

  if (dryRun) {
    log.title('Wiring it up')
    log.skip('Skipping config patches (postcss.config, globals.css, tsconfig.json, layout.tsx) — --dry-run')
    log.title('Done')
    log.info('Dry run — nothing was written. Re-run without --dry-run to actually install.')
    return
  }

  // ---- Patch configs ------------------------------------------------------------
  log.title('Wiring it up')

  const postcssResult = patchPostcssConfig(root)
  if (postcssResult === 'created') {
    log.success('Created postcss.config.mjs (Tailwind wasn\'t set up in this project yet)')
  } else if (postcssResult === 'already-present') {
    log.skip('postcss.config.mjs already runs @tailwindcss/postcss')
  } else {
    log.warn(
      'Found a postcss.config.* that doesn\'t reference @tailwindcss/postcss — add it to the plugins list by hand, or Tailwind classes won\'t compile.'
    )
  }

  const globalsCssPath = path.join(destRoot, 'app/globals.css')
  const globalsTemplate = await fetchRequiredTemplateText(remoteUrl(templateRootDir, 'globals.css'))
  const globalsResult = patchGlobalsCss(globalsCssPath, globalsTemplate)
  switch (globalsResult.action) {
    case 'created':
      log.success(`Created ${rel('app/globals.css')}`)
      break
    case 'replaced-stock':
      log.success('Replaced the default create-next-app globals.css with the theme-wired version')
      break
    case 'patched':
      if (globalsResult.addedThemeBlock) {
        log.success(
          `Patched ${rel('app/globals.css')}: added the Tailwind imports and the full @theme block (Tailwind wasn't set up in this project yet)`
        )
      } else if (globalsResult.addedImports.length || globalsResult.addedOther.length) {
        log.success(`Patched ${rel('app/globals.css')} with the missing @import/@plugin lines`)
      } else {
        log.skip(`${rel('app/globals.css')} already wired up`)
      }
      break
    case 'needs-manual-merge':
      log.warn(`${rel('app/globals.css')} needs a manual merge: ${globalsResult.reason}`)
      log.info(`Add this @theme block's contents into your existing one:\n${globalsTemplate}`)
      break
  }

  const tsconfigResult = patchTsconfig(project.tsconfigPath, aliasTarget)
  if (tsconfigResult === 'added-alias') log.success(`Added "@/*": ["${aliasTarget}"] path alias to tsconfig.json`)
  else if (tsconfigResult === 'created') log.success('Created tsconfig.json')
  else if (tsconfigResult === 'already-present') log.skip('tsconfig.json already has the "@/*" alias')
  else log.warn(`Could not parse tsconfig.json — add "@/*": ["${aliasTarget}"] under compilerOptions.paths by hand`)

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

  const includeTooltip = closure.has('tooltip')
  const includeToaster = closure.has('sonner')
  const layoutPath = path.join(destRoot, 'app/layout.tsx')
  const layoutResult = patchLayout(layoutPath, { includeTooltip, includeToaster })
  if (layoutResult.action === 'patched') {
    const bits = [includeTooltip && 'TooltipProvider', includeToaster && 'Toaster'].filter(Boolean)
    log.success(`Wired ${bits.join(' + ')} into ${rel('app/layout.tsx')}`)
  } else if (layoutResult.action === 'already-present') {
    log.skip(`${rel('app/layout.tsx')} already wires up TooltipProvider/Toaster`)
  } else if (layoutResult.action === 'not-needed') {
    log.skip('Neither Tooltip nor Sonner selected — layout.tsx left untouched')
  } else {
    log.warn(`Couldn't auto-wire ${rel('app/layout.tsx')} (${layoutResult.reason})`)
    const lines: string[] = []
    if (includeTooltip) lines.push(`  import { TooltipProvider } from '@/components/ui/tooltip'`)
    if (includeToaster) lines.push(`  import { Toaster } from '@/components/ui/sonner'`)
    lines.push('  …')
    lines.push(
      includeTooltip ? '  <TooltipProvider>{children}</TooltipProvider>' : '  {children}'
    )
    if (includeToaster) lines.push('  <Toaster />')
    log.info(`Add this yourself:\n${lines.join('\n')}`)
  }

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

  writeSelectionConfig(root, [...userChosen])

  // ---- Done ------------------------------------------------------------------------
  log.title('Done')
  log.success('Design system kit installed.')
  log.info(`Run your dev server, then visit ${pc.bold('/design-system')} and ${pc.bold('/theme-editor')}.`)
  log.info(`Run \`${pc.bold('design-kit init')}\` again any time to add more components.`)
  if (skipped.length) {
    log.warn(`${skipped.length} file(s) already existed and were left untouched — see the list above.`)
  }
}
