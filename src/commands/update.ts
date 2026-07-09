import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import { detectProject } from '../lib/detect.js'
import { confirm } from '../lib/confirm.js'
import { readSelectionConfig, recordFileHashes, hashContent } from '../lib/selection-state.js'
import { templateSharedDir, templateNextDir, templateViteDir } from '../lib/paths.js'
import { fetchTemplateText, mapWithConcurrency, remoteUrl } from '../lib/remote.js'
import { ALWAYS_SHARED_FILES, ALWAYS_NEXT_FILES, ALWAYS_VITE_FILES } from '../lib/managed-files.js'
import {
  THEME_EDITOR_REQUIRED_COMPONENTS,
  cssFilesFor,
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  resolveUiClosure,
} from '../lib/selection.js'
import { generateDesignSystemPage, generateLivePreview, generateNavTs, generateThemeIndexCss } from '../lib/codegen.js'
import { writeGeneratedFile } from '../lib/copy.js'

export type UpdateOptions = { cwd: string; yes: boolean; force: boolean; dryRun?: boolean }

type Managed = { relPath: string; templateSrc: string }
type Pending = Managed & { newContent: string }

const TOKEN_FILES = [
  'styles/theme/tokens/colors.css',
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
  const toolOnly = resolveUiClosure(THEME_EDITOR_REQUIRED_COMPONENTS)
  const userClosure = resolveUiClosure(userChosen)
  const closure = new Set([...userClosure, ...toolOnly])

  const srcDir = project.framework === 'next' ? (project.appDirRelative === 'src/app' ? 'src' : '') : 'src'
  const destRoot = path.join(root, srcDir)
  const rel = (p: string) => (srcDir ? `${srcDir}/${p}` : p)
  const sectionsRel = project.framework === 'next' ? 'app/design-system/_sections' : 'design-system/_sections'

  const navGroups = navGroupsFor(userClosure)
  const uiFiles = [...closure].filter((s) => s !== 'patterns').map((s) => `components/ui/${s}.tsx`)
  const cssFiles = [...cssFilesFor(closure)].map((f) => `styles/theme/components/${f}`)
  const extraFilesList = [...extraFilesFor(closure)]
  const sectionFiles = demoFilesFor(navGroups).map((f) => `${sectionsRel}/${f}`)

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
  ]

  const toWrite: Pending[] = []
  const skippedCustomized: string[] = []
  let upToDateCount = 0

  await mapWithConcurrency(managed, 8, async ({ relPath, templateSrc }) => {
    const newContent = await fetchTemplateText(templateSrc)
    if (newContent === null) return // renamed/removed in a newer template — nothing to sync to
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

  // CLI-generated files are always fully regenerated (they're never meant to be hand-edited).
  if (project.framework === 'next') {
    writeGeneratedFile(path.join(destRoot, 'app/design-system/_lib/nav.ts'), generateNavTs(navGroups))
    writeGeneratedFile(
      path.join(destRoot, 'app/design-system/page.tsx'),
      generateDesignSystemPage({
        navGroups,
        importBase: '@/app/design-system',
        sidebarImport: '@/app/design-system/_components/sidebar-nav',
        withMetadata: true,
      })
    )
    writeGeneratedFile(
      path.join(destRoot, 'app/theme-editor/_components/live-preview.tsx'),
      generateLivePreview({
        navGroups,
        designSystemImportBase: '@/app/design-system',
        themeEditorImportBase: '@/app/theme-editor',
      })
    )
  } else {
    writeGeneratedFile(path.join(root, 'src/design-system/_lib/nav.ts'), generateNavTs(navGroups))
    writeGeneratedFile(
      path.join(root, 'src/design-system/DesignSystemPage.tsx'),
      generateDesignSystemPage({
        navGroups,
        importBase: '@/design-system',
        sidebarImport: '@/design-system/_components/sidebar-nav',
        withMetadata: false,
      })
    )
    writeGeneratedFile(
      path.join(root, 'src/theme-editor/_components/live-preview.tsx'),
      generateLivePreview({
        navGroups,
        designSystemImportBase: '@/design-system',
        themeEditorImportBase: '@/theme-editor',
      })
    )
  }
  writeGeneratedFile(path.join(destRoot, 'styles/theme/index.css'), generateThemeIndexCss([...cssFilesFor(closure)]))
  log.success('Regenerated nav.ts, the design-system page, the theme editor live preview, and theme/index.css.')

  const manifestRun = spawnSync('node', ['scripts/generate-theme-manifest.mjs'], { cwd: root, stdio: 'pipe', encoding: 'utf8' })
  if (manifestRun.status === 0) {
    log.success(manifestRun.stdout.trim() || 'Regenerated theme.manifest.json')
  } else {
    log.warn(`Could not regenerate theme.manifest.json: ${manifestRun.stderr || manifestRun.error}`)
  }

  log.title('Done')
  log.success(`Updated ${toWrite.length} file(s).`)
  log.info(`Run \`${pc.bold('design-kit update --force')}\` if you want to overwrite the customized file(s) listed above too.`)
}
