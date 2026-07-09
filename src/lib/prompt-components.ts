import fs from 'node:fs'
import path from 'node:path'
import prompts from 'prompts'
import { GROUPS, COMPONENTS } from '../generated/registry.js'
import { log } from './log.js'
import { readSelectionConfig } from './selection-state.js'

/** Which component slugs already have a src/components/ui/<slug>.tsx on disk. */
export function detectInstalledComponents(root: string): Set<string> {
  const installed = new Set<string>()
  const uiDir = path.join(root, 'src/components/ui')
  for (const slug of Object.keys(COMPONENTS)) {
    if (COMPONENTS[slug].isPattern) continue
    if (fs.existsSync(path.join(uiDir, `${slug}.tsx`))) installed.add(slug)
  }
  return installed
}

/**
 * The baseline to pre-check in the picker / union into a re-run: prefer the persisted
 * design-kit.json (the user's own picks, never polluted by tool-chrome deps); fall back to
 * on-disk detection — minus whatever the theme editor's own chrome always needs — for a
 * project that ran an older version of this CLI before design-kit.json existed.
 */
export function priorSelectionFor(root: string, toolOnly: Set<string>): Set<string> {
  const config = readSelectionConfig(root)
  if (config.components.length) return new Set(config.components)
  const detected = detectInstalledComponents(root)
  return new Set([...detected].filter((s) => !toolOnly.has(s)))
}

export type ComponentPickOptions = {
  yes: boolean
  all?: boolean
  components?: string
}

/**
 * Resolves which component slugs the user wants. Priority: explicit --components list, then
 * --all / --yes (full install, the historical default), then an interactive multiselect
 * pre-checked with `prior` (design-kit.json from an earlier run, if any).
 */
export async function pickComponents(
  prior: Set<string>,
  options: ComponentPickOptions
): Promise<string[]> {
  const known = new Set(Object.keys(COMPONENTS))

  if (options.components) {
    const requested = options.components
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const invalid = requested.filter((s) => !known.has(s))
    if (invalid.length) {
      log.warn(`Unknown component slug(s), ignoring: ${invalid.join(', ')}`)
    }
    return requested.filter((s) => known.has(s))
  }

  if (options.all || options.yes) {
    return [...known]
  }

  const choices = GROUPS.filter((g) => !g.alwaysIncluded).flatMap((g) =>
    g.items.map((item) => ({
      title: `${g.title} › ${item.label}`,
      value: item.slug,
      selected: prior.has(item.slug),
    }))
  )

  log.info(
    'Type to search/filter, Space to toggle, Return to confirm. Components that depend on others (e.g. Combobox needs Popover) pull those in automatically.'
  )
  const res = await prompts({
    type: 'autocompleteMultiselect',
    name: 'components',
    message: 'Which components do you want installed?',
    choices,
    hint: '- Space to select, Return to submit, type to filter',
    instructions: false,
    limit: 15,
  })

  return Array.isArray(res.components) ? res.components : []
}
