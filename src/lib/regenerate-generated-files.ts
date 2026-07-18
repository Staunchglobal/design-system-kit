import { spawnSync } from 'node:child_process'
import path from 'node:path'
import type { NavGroup } from '../generated/registry.js'
import type { Framework } from './detect.js'
import {
  generateDesignSystemPage,
  generateLivePreview,
  generateNavTs,
  generateThemeIndexCss,
} from './codegen.js'
import { writeGeneratedFile } from './copy.js'
import { log } from './log.js'

type RegenerateGeneratedFilesOptions = {
  root: string
  destRoot: string
  framework: Framework
  navGroups: NavGroup[]
  cssFiles: string[]
  dryRun?: boolean
}

/**
 * Rebuilds every file wholly owned by the CLI after a selection change.
 * Keep init/update/remove routed through this function so their output cannot drift.
 */
export function regenerateGeneratedFiles({
  root,
  destRoot,
  framework,
  navGroups,
  cssFiles,
  dryRun = false,
}: RegenerateGeneratedFilesOptions): void {
  const isNext = framework === 'next'
  const designSystemDir = isNext ? 'app/design-system' : 'design-system'
  const themeEditorDir = isNext ? 'app/theme-editor' : 'theme-editor'
  const importBase = isNext ? '@/app/design-system' : '@/design-system'
  const themeEditorImportBase = isNext ? '@/app/theme-editor' : '@/theme-editor'

  writeGeneratedFile(
    path.join(destRoot, designSystemDir, '_lib/nav.ts'),
    generateNavTs(navGroups),
    dryRun
  )
  writeGeneratedFile(
    path.join(destRoot, designSystemDir, isNext ? 'page.tsx' : 'DesignSystemPage.tsx'),
    generateDesignSystemPage({
      navGroups,
      importBase,
      sidebarImport: `${importBase}/_components/sidebar-nav`,
      withMetadata: isNext,
    }),
    dryRun
  )
  writeGeneratedFile(
    path.join(destRoot, themeEditorDir, '_components/live-preview.tsx'),
    generateLivePreview({
      navGroups,
      designSystemImportBase: importBase,
      themeEditorImportBase,
    }),
    dryRun
  )
  writeGeneratedFile(
    path.join(destRoot, 'styles/theme/index.css'),
    generateThemeIndexCss(cssFiles),
    dryRun
  )

  log.success(
    `${dryRun ? 'Would regenerate' : 'Regenerated'} nav.ts, the design-system page, ` +
      'the theme-editor live preview, and theme/index.css.'
  )

  if (dryRun) return

  const manifestRun = spawnSync('node', ['scripts/generate-theme-manifest.mjs'], {
    cwd: root,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (manifestRun.status === 0) {
    log.success(manifestRun.stdout.trim() || 'Regenerated theme.manifest.json')
  } else {
    log.warn(`Could not regenerate theme.manifest.json: ${manifestRun.stderr || manifestRun.error}`)
  }
}
