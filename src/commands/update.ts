import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import { detectProject, detectPackageManager } from '../lib/detect.js'
import { confirm } from '../lib/confirm.js'
import { readSelectionConfig, recordFileHashes, hashContent } from '../lib/selection-state.js'
import { templateSharedDir, templateNextDir, templateViteDir } from '../lib/paths.js'
import { fetchTemplateText, mapWithConcurrency, remoteUrl } from '../lib/remote.js'
import { ALWAYS_SHARED_FILES, ALWAYS_NEXT_FILES, ALWAYS_VITE_FILES, frameworkExtraFilesFor } from '../lib/managed-files.js'
import {
  cssFilesFor,
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  npmDepsFor,
  resolveUiClosure,
} from '../lib/selection.js'
import { ALL_RUNTIME_DEPENDENCIES, missingDeps, runInstall } from '../lib/deps.js'
import { regenerateGeneratedFiles } from '../lib/regenerate-generated-files.js'

export type UpdateOptions = { cwd: string; yes: boolean; force: boolean; dryRun?: boolean }

type Managed = { relPath: string; templateSrc: string }
type Pending = Managed & { newContent: string }

const TOKEN_FILES = [
  'styles/theme/tokens/color-scales.css',
  'styles/theme/tokens/colors.css',
  'styles/theme/tokens/shadows.css',
  'styles/theme/tokens/radius.css',
  'styles/theme/tokens/fonts.css',
  'styles/theme/tokens/typography.css',
  'styles/theme/tokens/typography-patterns.css',
]

/**
 * Re-syncs every file `init` installed for your current selection to whatever the *currently
 * installed CLI version's* template looks like now — for picking up fixes/improvements made to
 * this package after you first ran `init`, without re-running the whole picker.
 *
 * A file only gets overwritten if its disk content still exactly matches the hash recorded the
 * last time init/update actually wrote it (see selection-state.ts) — if you've edited it since,
 * it's left alone and reported as "customized, skipped" unless you pass --force. Files newly
 * required by your existing selection (e.g. a component's dependencies grew in a newer template)
 * are copied fresh. Never removes a file — that's `design-kit remove`'s job.
 */
export async function update(options: UpdateOptions) {
  const root = path.resolve(options.cwd)
  log.title('Update installed files')

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

  if (!fs.existsSync(path.join(root, 'design-kit.json'))) {
    log.error('No design-kit.json found — nothing to update. Run `design-kit init` first.')
    process.exitCode = 1
    return
  }

  const selection = readSelectionConfig(root)
  const userChosen = new Set(selection.components)
  const userClosure = resolveUiClosure(userChosen)

  const srcDir = project.framework === 'next' ? (project.appDirRelative === 'src/app' ? 'src' : '') : 'src'
  const destRoot = path.join(root, srcDir)
  const rel = (p: string) => path.normalize(srcDir ? `${srcDir}/${p}` : p)
  const sectionsRel = project.framework === 'next' ? 'app/design-system/_sections' : 'design-system/_sections'

  const navGroups = navGroupsFor(userClosure)
  const uiFiles = [...userClosure].filter((s) => s !== 'patterns').map((s) => `components/ui/${s}.tsx`)
  const cssFiles = [...cssFilesFor(userClosure)].map((f) => `styles/theme/components/${f}`)
  const extraFilesList = [...extraFilesFor(userClosure)]
  const sectionFiles = demoFilesFor(navGroups).map((f) => `${sectionsRel}/${f}`)
  const frameworkExtraFiles = frameworkExtraFilesFor(
    userClosure,
    project.framework === 'next' ? 'next' : 'vite'
  )

  const alwaysFixed = project.framework === 'next' ? ALWAYS_NEXT_FILES : ALWAYS_VITE_FILES
  const frameworkTemplateDir = project.framework === 'next' ? templateNextDir : templateViteDir
  const sharedSrc = remoteUrl(templateSharedDir, 'src')
  const frameworkSrc = remoteUrl(frameworkTemplateDir, 'src')

  const managed: Managed[] = [
    ...ALWAYS_SHARED_FILES.map((f) => ({ relPath: f, templateSrc: remoteUrl(sharedSrc, f) })),
    ...uiFiles.map((f) => ({ relPath: f, templateSrc: remoteUrl(sharedSrc, f) })),
    ...cssFiles.map((f) => ({ relPath: f, templateSrc: remoteUrl(sharedSrc, f) })),
    ...extraFilesList.map((f) => ({ relPath: f, templateSrc: remoteUrl(sharedSrc, f) })),
    ...TOKEN_FILES.map((f) => ({ relPath: f, templateSrc: remoteUrl(sharedSrc, f) })),
    ...alwaysFixed.map((f) => ({ relPath: f, templateSrc: remoteUrl(frameworkSrc, f) })),
    ...sectionFiles.map((f) => ({ relPath: f, templateSrc: remoteUrl(frameworkSrc, f) })),
    ...frameworkExtraFiles.map((f) => ({ relPath: f, templateSrc: remoteUrl(frameworkSrc, f) })),
  ]

  const toWrite: Pending[] = []
  const skippedCustomized: string[] = []
  let upToDateCount = 0

  await mapWithConcurrency(managed, 8, async ({ relPath, templateSrc }) => {
    const newContent = await fetchTemplateText(templateSrc)
    if (newContent === null) return
    const destPath = path.join(destRoot, relPath)

    if (!fs.existsSync(destPath)) {
      toWrite.push({ relPath, templateSrc, newContent })
      return
    }

    const currentContent = fs.readFileSync(destPath, 'utf8')
    if (currentContent === newContent) {
      upToDateCount++
      return
    }

    const currentHash = hashContent(currentContent)
    const baselineHash = selection.fileHashes[relPath]
    const matchesBaseline = baselineHash !== undefined && currentHash === baselineHash

    if (matchesBaseline || options.force) {
      toWrite.push({ relPath, templateSrc, newContent })
    } else {
      skippedCustomized.push(relPath)
    }
  })

  // A newer template can require an npm dependency the consumer's
  // original `init` run never installed (e.g. chat's cable-connection.ts
  // gaining an `@rails/actioncable` import) — without this, `update`
  // happily writes the new file and the consumer's very next build fails
  // with "Cannot find module", with no warning from this command at all.
  const existingDeps = {
    ...((project.packageJson.dependencies as Record<string, string>) ?? {}),
    ...((project.packageJson.devDependencies as Record<string, string>) ?? {}),
  }
  const neededRuntime: Record<string, string> = {}
  for (const dep of npmDepsFor(userClosure)) {
    if (ALL_RUNTIME_DEPENDENCIES[dep]) neededRuntime[dep] = ALL_RUNTIME_DEPENDENCIES[dep]
  }
  const runtimeToInstall = missingDeps(neededRuntime, existingDeps)

  if (Object.keys(runtimeToInstall).length) {
    log.title('Dependencies')
    log.warn(`Your current selection now needs: ${Object.keys(runtimeToInstall).join(', ')}`)
    if (options.dryRun) {
      log.skip('Skipping install (--dry-run).')
    } else if (await confirm('Install these now?', options.yes)) {
      const pm = detectPackageManager(root)
      const res = runInstall(pm, root, runtimeToInstall, false)
      if (!res.ok) {
        log.error(`Dependency install failed: ${res.message}`)
        process.exitCode = 1
        return
      }
      log.success('Dependencies installed.')
    } else {
      log.skip('Skipped install — run it yourself before building, or the new file(s) below will fail to compile.')
    }
  }

  log.title('Files')
  log.info(`${upToDateCount} file(s) already match the current template.`)
  if (skippedCustomized.length) {
    log.warn(`${skippedCustomized.length} file(s) look customized — left alone (pass --force to overwrite anyway):`)
    for (const f of skippedCustomized) log.warn(`  ${rel(f)}`)
  }

  if (!toWrite.length) {
    log.success('Nothing to update.')
    return
  }

  log.title('Will update')
  for (const { relPath } of toWrite) log.info(rel(relPath))

  if (options.dryRun) {
    log.title('Done')
    log.info('Dry run — nothing was changed. Re-run without --dry-run to actually write these files.')
    return
  }

  if (!(await confirm(`Write ${toWrite.length} file(s)?`, options.yes))) {
    log.info('Aborted — nothing was changed.')
    return
  }

  for (const { relPath, newContent } of toWrite) {
    const destPath = path.join(destRoot, relPath)
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    fs.writeFileSync(destPath, newContent)
  }
  log.success(`Wrote ${toWrite.length} file(s).`)

  recordFileHashes(
    root,
    toWrite.map(({ relPath, newContent }) => ({ destRel: relPath, templateContent: newContent, written: true }))
  )

  regenerateGeneratedFiles({
    destRoot,
    framework: project.framework,
    navGroups,
    cssFiles: [...cssFilesFor(userClosure)],
    closure: userClosure,
  })

  log.title('Done')
  log.success(`Updated ${toWrite.length} file(s).`)
  log.info(`Run \`${pc.bold('design-kit update --force')}\` if you want to overwrite the customized file(s) listed above too.`)
}
