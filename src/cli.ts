import { Command } from 'commander'
import { init } from './commands/init.js'
import { remove } from './commands/remove.js'
import { update } from './commands/update.js'
import type { PackageManager } from './lib/detect.js'
import { applyLocalTemplatesOption } from './lib/local-templates.js'

const program = new Command()

program
  .name('design-kit')
  .description(
    'Scaffolds a full shadcn/ui component set, a token-driven theme system, a /design-system showcase, and a live /theme-editor into a Next.js (App Router) + TypeScript + Tailwind v4 project.'
  )
  .version('0.1.0')
  .option(
    '--templates <path>',
    'use a local design-system-kit checkout for templates instead of the CDN (maintainer/dev; same as DESIGN_KIT_LOCAL_TEMPLATES)'
  )
  .hook('preAction', (thisCommand) => {
    // Global opts live on the root program; subcommands inherit via parent.
    const root = thisCommand.parent ?? thisCommand
    const templates = (root.opts() as { templates?: string }).templates
    applyLocalTemplatesOption(templates)
  })

program
  .command('init')
  .description('Install dependencies and copy the design system + theme editor into this project')
  .option('--cwd <path>', 'run against a different project directory', process.cwd())
  .option('--pm <manager>', 'force a package manager (npm, pnpm, yarn, bun)')
  .option('-y, --yes', 'skip confirmation prompts (implies --all unless --components is given)', false)
  .option('--skip-install', 'skip installing dependencies', false)
  .option('--all', 'install every component, skipping the picker', false)
  .option(
    '--components <slugs>',
    'comma-separated component slugs to install (e.g. button,dialog,input), skipping the picker'
  )
  .option('--dry-run', "preview what would be installed/changed without writing anything", false)
  .option('--report', 'print a source-size + npm dependency breakdown for the selection before installing', false)
  .action(async (opts) => {
    await init({
      cwd: opts.cwd,
      pm: opts.pm as PackageManager | undefined,
      yes: !!opts.yes,
      skipInstall: !!opts.skipInstall,
      all: !!opts.all,
      components: opts.components as string | undefined,
      dryRun: !!opts.dryRun,
      report: !!opts.report,
    })
  })

program
  .command('remove')
  .description('Uninstall one or more previously-installed components and regenerate the design-system/theme-editor')
  .argument('<components>', 'comma-separated component slugs to remove (e.g. button,dialog)')
  .option('--cwd <path>', 'run against a different project directory', process.cwd())
  .option('-y, --yes', 'skip the confirmation prompt', false)
  .option('--dry-run', 'preview which files would be deleted without deleting anything', false)
  .action(async (components, opts) => {
    await remove({
      cwd: opts.cwd,
      yes: !!opts.yes,
      components,
      dryRun: !!opts.dryRun,
    })
  })

program
  .command('update')
  .description("Re-sync your currently-installed files to this CLI version's templates (skips anything you've customized)")
  .option('--cwd <path>', 'run against a different project directory', process.cwd())
  .option('-y, --yes', 'skip the confirmation prompt', false)
  .option('--force', 'overwrite files that look customized too', false)
  .option('--dry-run', 'preview which files would be updated without writing anything', false)
  .action(async (opts) => {
    await update({
      cwd: opts.cwd,
      yes: !!opts.yes,
      force: !!opts.force,
      dryRun: !!opts.dryRun,
    })
  })

program.parseAsync(process.argv)
