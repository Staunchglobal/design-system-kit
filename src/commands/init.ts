import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { log } from '../lib/log.js'
import { detectProject, detectPackageManager, isMonorepoRoot, findWorkspaceApps } from '../lib/detect.js'
import { confirm } from '../lib/confirm.js'
import { runNextInit, type InitOptions } from './init-next.js'
import { runViteInit } from './init-vite.js'

export type { InitOptions } from './init-next.js'

export async function init(options: InitOptions) {
  const root = path.resolve(options.cwd)
  log.title('Next.js / Vite Design System Kit')

  if (!fs.existsSync(path.join(root, 'package.json'))) {
    log.error(`No package.json found at ${root}. Run this inside your project.`)
    process.exitCode = 1
    return
  }

  const project = detectProject(root)

  if (!project.framework) {
    if (isMonorepoRoot(root, project.packageJson)) {
      const candidates = findWorkspaceApps(root)
      log.error('No "next" or "vite" dependency here — this looks like a monorepo root, not an app directory.')
      if (candidates.length) {
        log.info('Found these apps inside it:')
        for (const c of candidates) log.info(`  ${c.relativePath}  (${c.framework})`)
        log.info(`Re-run from inside one of them, or point --cwd at it, e.g.:`)
        log.info(`  design-kit init --cwd ${candidates[0].relativePath}`)
      } else {
        log.info(
          'Could not find a Next.js/Vite app under apps/* or packages/* — cd into your app directory (or pass --cwd) and re-run.'
        )
      }
    } else {
      log.error(
        'Could not find a "next" or "vite" dependency in package.json — this kit supports Next.js (App Router) and Vite + React projects.'
      )
    }
    process.exitCode = 1
    return
  }

  if (project.framework === 'next' && project.nextMajor !== null && project.nextMajor < 16) {
    log.warn(
      `Detected Next.js ${project.nextVersion} — this kit was built against Next.js 16+. Some pieces (App Router APIs, Tailwind v4) may not line up on older versions.`
    )
    if (!(await confirm('Continue anyway?', options.yes))) {
      log.info('Aborted.')
      return
    }
  }

  if (!project.hasTypeScriptDependency || !project.hasTsconfig) {
    log.error(
      'This kit requires a TypeScript project (a "typescript" dependency and a tsconfig). Set up TypeScript first, then re-run.'
    )
    process.exitCode = 1
    return
  }

  const pm = options.pm ?? detectPackageManager(root)
  log.info(`Framework: ${pc.bold(project.framework)}`)
  log.info(`Package manager: ${pc.bold(pm)}`)
  log.info(`Project root: ${pc.bold(root)}`)

  if (project.framework === 'next') {
    await runNextInit(project, pm, options)
  } else {
    await runViteInit(project, pm, options)
  }
}
