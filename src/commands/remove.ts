import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import { detectProject } from '../lib/detect.js'
import { confirm } from '../lib/confirm.js'
import { readSelectionConfig, writeSelectionConfig } from '../lib/selection-state.js'
import {
  THEME_EDITOR_REQUIRED_COMPONENTS,
  cssFilesFor,
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  npmDepsFor,
  resolveUiClosure,
} from '../lib/selection.js'
import { generateDesignSystemPage, generateLivePreview, generateNavTs, generateThemeIndexCss } from '../lib/codegen.js'
import { writeGeneratedFile } from '../lib/copy.js'
import { COMPONENTS } from '../generated/registry.js'
import { frameworkExtraFilesFor } from '../lib/managed-files.js'

export type RemoveOptions = {
  cwd: string
  yes: boolean
  components: string
  dryRun?: boolean
}

/** Deletes a file if it exists — a no-op (not an error) if it's already gone. */
function removeFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false
  fs.rmSync(filePath)
  return true
}

export async function remove(options: RemoveOptions) {
  const root = path.resolve(options.cwd)
  log.title('Remove components')

  if (!fs.existsSync(path.join(root, 'package.json'))) {
    log.error(`No package.json found at ${root}. Run this inside your project.`)
    process.exitCode = 1
    return
  }

  const project = detectProject(root)
  if (!project.framework) {
    log.error('Could not find a "next" or "vite" dependency in package.json.')
    process.exitCode = 1
    return
  }

  const selectionConfigPath = path.join(root, 'design-kit.json')
  if (!fs.existsSync(selectionConfigPath)) {
    log.error('No design-kit.json found — nothing to remove. Run `design-kit init` first.')
    process.exitCode = 1
    return
  }

  const requested = [...new Set(options.components.split(',').map((s) => s.trim()).filter(Boolean))]
  if (!requested.length) {
    log.error('No component slugs given.')
    process.exitCode = 1
    return
  }

  const unknown = requested.filter((s) => !COMPONENTS[s])
  if (unknown.length) {
    log.error(`Unknown component slug(s): ${unknown.join(', ')}`)
    process.exitCode = 1
    return
  }

  const selection = readSelectionConfig(root)
  const userChosen = new Set(selection.components)
  const toolOnly = resolveUiClosure(THEME_EDITOR_REQUIRED_COMPONENTS)

  const notInstalled = requested.filter((s) => !userChosen.has(s))
  if (notInstalled.length) log.warn(`Not currently installed (skipping): ${notInstalled.join(', ')}`)

  const toRemove = new Set(requested.filter((s) => userChosen.has(s)))
  if (!toRemove.size) {
    log.info('Nothing to remove.')
    return
  }

  const oldUserClosure = resolveUiClosure(userChosen)
  const oldClosure = new Set([...oldUserClosure, ...toolOnly])
  const remaining = new Set([...userChosen].filter((s) => !toRemove.has(s)))
  const newUserClosure = resolveUiClosure(remaining)
  const newClosure = new Set([...newUserClosure, ...toolOnly])

  // A component you asked to remove might still be a dependency of something you're keeping
  // (e.g. asking to remove "button" while "combobox" — which needs it — stays selected) — the
  // closure recomputation above naturally keeps it, so tell the user why instead of pretending
  // it's gone.
  const keptDueToDeps = [...toRemove].filter((s) => newClosure.has(s))
  for (const slug of keptDueToDeps) {
    const dependents = [...remaining].filter((other) => resolveUiClosure([other]).has(slug))
    log.warn(`Kept "${slug}" — still required by: ${dependents.length ? dependents.join(', ') : 'the theme editor'}`)
  }

  const orphaned = [...oldClosure].filter((s) => !newClosure.has(s))
  if (!orphaned.length) {
    log.info('Nothing was actually removed (everything requested is still required by something else).')
    return
  }

  const srcDir = project.framework === 'next' ? (project.appDirRelative === 'src/app' ? 'src' : '') : 'src'
  const destRoot = path.join(root, srcDir)
  const rel = (p: string) => (srcDir ? `${srcDir}/${p}` : p)
  const sectionsRel = project.framework === 'next' ? 'app/design-system/_sections' : 'design-system/_sections'

  // Nav/demo generation must key off the *user's own* closure, not the tool-chrome-inclusive
  // one — toolOnly components (field, input-group, native-select) get their ui/*.tsx installed
  // for the theme editor's own use but never get a demo file copied or a nav entry at all (see
  // the same distinction in init-next.ts/init-vite.ts). Using oldClosure/newClosure here would
  // regenerate a page.tsx that imports demo files that were never actually installed.
  const oldNavGroups = navGroupsFor(oldUserClosure)
  const newNavGroups = navGroupsFor(newUserClosure)
  const oldDemoFiles = new Set(demoFilesFor(oldNavGroups))
  const newDemoFiles = new Set(demoFilesFor(newNavGroups))
  const orphanedDemoFiles = [...oldDemoFiles].filter((f) => !newDemoFiles.has(f))

  const oldExtraFiles = extraFilesFor(oldClosure)
  const newExtraFiles = extraFilesFor(newClosure)
  const orphanedExtraFiles = [...oldExtraFiles].filter((f) => !newExtraFiles.has(f))

  const frameworkKey = project.framework === 'next' ? 'next' : 'vite'
  const oldFrameworkExtra = new Set(frameworkExtraFilesFor(oldUserClosure, frameworkKey))
  const newFrameworkExtra = new Set(frameworkExtraFilesFor(newUserClosure, frameworkKey))
  const orphanedFrameworkExtra = [...oldFrameworkExtra].filter((f) => !newFrameworkExtra.has(f))

  const filesToDelete: string[] = [
    ...orphaned.filter((s) => s !== 'patterns').map((s) => rel(`components/ui/${s}.tsx`)),
    ...orphaned
      .map((s) => COMPONENTS[s]?.cssFile)
      .filter((f): f is string => !!f)
      .map((f) => rel(`styles/theme/components/${f}`)),
    ...orphanedExtraFiles.map((f) => rel(f)),
    ...orphanedDemoFiles.map((f) => rel(`${sectionsRel}/${f}`)),
    ...orphanedFrameworkExtra.map((f) => rel(f)),
  ]

  log.title('Files to delete')
  for (const f of filesToDelete) log.warn(f)
  log.info(
    "These are your project's own copies — if you've customized any of them, back them up first."
  )

  if (options.dryRun) {
    log.title('Done')
    log.info('Dry run — nothing was changed. Re-run without --dry-run to actually delete these files.')
    return
  }

  if (!(await confirm(`Delete these ${filesToDelete.length} file(s)?`, options.yes))) {
    log.info('Aborted — nothing was changed.')
    return
  }

  let deletedCount = 0
  for (const f of filesToDelete) {
    if (removeFile(path.join(root, f))) deletedCount++
  }
  log.success(`Deleted ${deletedCount} file(s).`)

  writeGeneratedFile(path.join(destRoot, `${project.framework === 'next' ? 'app/design-system' : 'design-system'}/_lib/nav.ts`), generateNavTs(newNavGroups))

  if (project.framework === 'next') {
    writeGeneratedFile(
      path.join(destRoot, 'app/design-system/page.tsx'),
      generateDesignSystemPage({
        navGroups: newNavGroups,
        importBase: '@/app/design-system',
        sidebarImport: '@/app/design-system/_components/sidebar-nav',
        withMetadata: true,
      })
    )
    writeGeneratedFile(
      path.join(destRoot, 'app/theme-editor/_components/live-preview.tsx'),
      generateLivePreview({
        navGroups: newNavGroups,
        designSystemImportBase: '@/app/design-system',
        themeEditorImportBase: '@/app/theme-editor',
      })
    )
  } else {
    writeGeneratedFile(
      path.join(root, 'src/design-system/DesignSystemPage.tsx'),
      generateDesignSystemPage({
        navGroups: newNavGroups,
        importBase: '@/design-system',
        sidebarImport: '@/design-system/_components/sidebar-nav',
        withMetadata: false,
      })
    )
    writeGeneratedFile(
      path.join(root, 'src/theme-editor/_components/live-preview.tsx'),
      generateLivePreview({
        navGroups: newNavGroups,
        designSystemImportBase: '@/design-system',
        themeEditorImportBase: '@/theme-editor',
      })
    )
  }
  log.success('Regenerated nav.ts, the design-system page, and the theme editor live preview.')

  writeGeneratedFile(path.join(destRoot, 'styles/theme/index.css'), generateThemeIndexCss([...cssFilesFor(newClosure)]))
  log.success(`Regenerated ${rel('styles/theme/index.css')}.`)

  writeSelectionConfig(root, [...remaining])

  const manifestRun = spawnSync('node', ['scripts/generate-theme-manifest.mjs'], { cwd: root, stdio: 'pipe', encoding: 'utf8' })
  if (manifestRun.status === 0) {
    log.success(manifestRun.stdout.trim() || 'Regenerated theme.manifest.json')
  } else {
    log.warn(`Could not regenerate theme.manifest.json: ${manifestRun.stderr || manifestRun.error}`)
  }

  const removedTooltip = orphaned.includes('tooltip')
  const removedToaster = orphaned.includes('sonner')
  if (removedTooltip || removedToaster) {
    const bits = [removedTooltip && 'TooltipProvider', removedToaster && 'Toaster'].filter(Boolean)
    log.warn(
      `Removed ${bits.join(' + ')}, but left the JSX wiring in ${project.framework === 'next' ? 'layout.tsx' : 'your app root'} — the import will now 404. Remove the wrapper/tag by hand.`
    )
  }

  const oldNpmDeps = npmDepsFor(oldClosure)
  const newNpmDeps = npmDepsFor(newClosure)
  const unneededNpmDeps = [...oldNpmDeps].filter((d) => !newNpmDeps.has(d))
  if (unneededNpmDeps.length) {
    log.info(`These npm packages may no longer be needed: ${unneededNpmDeps.join(', ')} — remove them yourself if nothing else uses them.`)
  }

  log.title('Done')
  log.success(`Removed: ${[...orphaned].sort().join(', ')}`)
  log.info(`Run \`${pc.bold('design-kit init')}\` any time to add components back.`)
}
