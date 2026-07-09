import { COMPONENTS, GROUPS } from '../generated/registry.js'
import type { NavGroup } from '../generated/registry.js'

/**
 * The theme editor's own chrome (Save/Reset buttons, filter Input, the Add-color/font/
 * typography mini-forms, its Select dropdowns) — needed no matter which components the user
 * picks for their app. Resolved with plain resolveUiClosure, so it never drags an unrelated
 * demo section into the design-system showcase just because the editor itself needs a
 * Field/Input/Button — each component now has its own demo file (scripts/split-sections.mjs),
 * so pulling in a ui-dep no longer means pulling in its whole category's demos too.
 */
export const THEME_EDITOR_REQUIRED_COMPONENTS = ['field', 'input-group', 'native-select']

/** All real, selectable component slugs (excludes the "patterns" pseudo-component). */
export function allComponentSlugs(): string[] {
  return Object.keys(COMPONENTS)
}

/** Follows uiDeps transitively — e.g. picking "combobox" pulls in "popover" + "command". */
export function resolveUiClosure(selected: Iterable<string>): Set<string> {
  const closure = new Set<string>()
  const stack = [...selected]
  while (stack.length) {
    const slug = stack.pop()!
    if (closure.has(slug) || !COMPONENTS[slug]) continue
    closure.add(slug)
    for (const dep of COMPONENTS[slug].uiDeps) stack.push(dep)
  }
  return closure
}

/**
 * Nav groups filtered down to only the items in `closure` (plus always-included groups in
 * full) — in registry order. Each item has its own demo file, so this is a direct filter, not
 * an expand-and-reconverge: no fixed-point loop needed since including one component's demo
 * never requires including any other component's demo to compile.
 */
export function navGroupsFor(closure: Set<string>): NavGroup[] {
  return GROUPS.map((g) => ({
    ...g,
    items: g.alwaysIncluded ? g.items : g.items.filter((item) => closure.has(item.slug)),
  })).filter((g) => g.items.length > 0)
}

/** Every _sections/*.tsx (and _shared/*.tsx companion) file needed to demo these nav groups. */
export function demoFilesFor(navGroups: NavGroup[]): string[] {
  const files = new Set<string>()
  for (const g of navGroups) {
    for (const item of g.items) {
      files.add(item.demoFile)
      for (const extra of item.extraDemoFiles) files.add(extra)
    }
  }
  return [...files]
}

export function npmDepsFor(closure: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const slug of closure) {
    const entry = COMPONENTS[slug]
    if (entry) for (const dep of entry.npmDeps) out.add(dep)
  }
  return out
}

export function extraFilesFor(closure: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const slug of closure) {
    const entry = COMPONENTS[slug]
    if (entry) for (const f of entry.extraFiles) out.add(f)
  }
  return out
}

export function cssFilesFor(closure: Set<string>): Set<string> {
  const out = new Set<string>()
  for (const slug of closure) {
    const cssFile = COMPONENTS[slug]?.cssFile
    if (cssFile) out.add(cssFile)
  }
  return out
}
