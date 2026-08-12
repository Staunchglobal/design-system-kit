import path from 'node:path'
import type { NavGroup } from '../generated/registry.js'
import type { Framework } from './detect.js'
import {
  generateAppNavTs,
  generateDesignSystemPage,
  generateNavTs,
  generateRoutesTsx,
  generateThemeIndexCss,
} from './codegen.js'
import { writeGeneratedFile } from './copy.js'
import { log } from './log.js'
import { privateNavItemsFor, viteRoutesFor } from './managed-files.js'

type RegenerateGeneratedFilesOptions = {
  destRoot: string
  framework: Framework
  navGroups: NavGroup[]
  cssFiles: string[]
  closure: Set<string>
  dryRun?: boolean
}

/**
 * Rebuilds every file wholly owned by the CLI after a selection change.
 * Keep init/update/remove routed through this function so their output cannot drift.
 */
export function regenerateGeneratedFiles({
  destRoot,
  framework,
  navGroups,
  cssFiles,
  closure,
  dryRun = false,
}: RegenerateGeneratedFilesOptions): void {
  const isNext = framework === 'next'
  const designSystemDir = isNext ? 'app/design-system' : 'design-system'
  const importBase = isNext ? '@/app/design-system' : '@/design-system'

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
    path.join(destRoot, 'styles/theme/index.css'),
    generateThemeIndexCss(cssFiles),
    dryRun
  )

  if (isNext) {
    writeGeneratedFile(
      path.join(destRoot, 'app/(app)/_nav.ts'),
      generateAppNavTs(privateNavItemsFor(closure)),
      dryRun
    )
  } else {
    writeGeneratedFile(path.join(destRoot, 'routes.tsx'), generateRoutesTsx(viteRoutesFor(closure)), dryRun)
  }

  log.success(
    `${dryRun ? 'Would regenerate' : 'Regenerated'} nav.ts, the design-system page, ` +
      `theme/index.css, and ${isNext ? 'app/(app)/_nav.ts' : 'routes.tsx'}.`
  )
}
