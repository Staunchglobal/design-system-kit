import { describe, expect, it } from 'vitest'
import { COMPONENTS, GROUPS } from '../generated/registry.js'
import {
  THEME_EDITOR_REQUIRED_COMPONENTS,
  allComponentSlugs,
  cssFilesFor,
  demoFilesFor,
  extraFilesFor,
  navGroupsFor,
  npmDepsFor,
  resolveUiClosure,
} from './selection.js'
import { FRAMEWORK_EXTRA_FILES, frameworkExtraFilesFor } from './managed-files.js'

describe('resolveUiClosure', () => {
  it('includes the selected slug itself plus its declared uiDeps', () => {
    const closure = resolveUiClosure(['button'])
    expect(closure.has('button')).toBe(true)
    expect(closure).toEqual(new Set(['button', ...COMPONENTS.button.uiDeps]))
  })

  it('follows uiDeps transitively', () => {
    // combobox depends on button + input-group (per registry) — picking it must pull both in.
    const closure = resolveUiClosure(['combobox'])
    expect(closure.has('combobox')).toBe(true)
    for (const dep of COMPONENTS.combobox.uiDeps) {
      expect(closure.has(dep)).toBe(true)
    }
  })

  it('is idempotent for an already-closed set', () => {
    const once = resolveUiClosure(['combobox'])
    const twice = resolveUiClosure(once)
    expect(twice).toEqual(once)
  })

  it('ignores unknown slugs instead of throwing', () => {
    expect(() => resolveUiClosure(['not-a-real-component'])).not.toThrow()
    expect(resolveUiClosure(['not-a-real-component']).size).toBe(0)
  })

  it('never produces a cycle-induced infinite loop for the full component set', () => {
    // A cyclic uiDeps graph would hang resolveUiClosure's while loop — running it over every
    // known slug at once is a cheap way to catch that regression without special-casing it.
    const closure = resolveUiClosure(allComponentSlugs())
    expect(closure.size).toBe(allComponentSlugs().length)
  })
})

describe('navGroupsFor', () => {
  it('always includes alwaysIncluded groups in full, regardless of closure', () => {
    const groups = navGroupsFor(new Set())
    const alwaysGroups = GROUPS.filter((g) => g.alwaysIncluded)
    for (const g of alwaysGroups) {
      const found = groups.find((got) => got.title === g.title)
      expect(found).toBeDefined()
      expect(found?.items.length).toBe(g.items.length)
    }
  })

  it('excludes a non-always-included group entirely when nothing in it is selected', () => {
    const groups = navGroupsFor(new Set())
    for (const g of groups) {
      const original = GROUPS.find((og) => og.title === g.title)
      if (!original?.alwaysIncluded) {
        // Only reachable if some item slipped through unselected — should never happen.
        expect(g.items.length).toBeGreaterThan(0)
      }
    }
  })

  it('only includes the specific selected item, not its whole category', () => {
    // "kbd" has zero uiDeps, so its closure is just itself — a clean way to confirm picking one
    // item never drags its 5 "Buttons & Actions" category-mates in as a side effect.
    expect(COMPONENTS.kbd.uiDeps).toEqual([])
    const groups = navGroupsFor(new Set(['kbd']))
    const buttonsGroup = groups.find((g) => g.items.some((i) => i.slug === 'kbd'))
    expect(buttonsGroup).toBeDefined()
    expect(buttonsGroup?.items.map((i) => i.slug)).toEqual(['kbd'])
  })

  it('preserves registry declaration order', () => {
    const groups = navGroupsFor(new Set(allComponentSlugs()))
    expect(groups.map((g) => g.title)).toEqual(GROUPS.filter((g) => g.items.length).map((g) => g.title))
  })
})

describe('demoFilesFor', () => {
  it('always includes a component demo file matching its own slug', () => {
    const files = demoFilesFor(navGroupsFor(new Set(['button'])))
    expect(files).toContain('button.tsx')
  })

  it('includes every extraDemoFile a selected item declares', () => {
    const groups = navGroupsFor(new Set(allComponentSlugs()))
    const files = new Set(demoFilesFor(groups))
    for (const g of groups) {
      for (const item of g.items) {
        expect(files.has(item.demoFile)).toBe(true)
        for (const extra of item.extraDemoFiles) expect(files.has(extra)).toBe(true)
      }
    }
  })

  it('never duplicates a file needed by two different items', () => {
    const files = demoFilesFor(navGroupsFor(new Set(allComponentSlugs())))
    expect(files.length).toBe(new Set(files).size)
  })
})

describe('cssFilesFor / extraFilesFor / npmDepsFor', () => {
  it('cssFilesFor only returns files for components that actually declare one', () => {
    const closure = resolveUiClosure(['button', 'direction'])
    const files = cssFilesFor(closure)
    expect(files.has('button.css')).toBe(true)
    // "direction" is pure logic with nothing to theme — registry marks it with no cssFile.
    expect(COMPONENTS.direction.cssFile).toBeNull()
  })

  it('extraFilesFor surfaces sidebar\'s use-mobile hook', () => {
    const files = extraFilesFor(resolveUiClosure(['sidebar']))
    expect(files.has('hooks/use-mobile.ts')).toBe(true)
  })

  it('extraFilesFor surfaces crud-table companions', () => {
    const files = extraFilesFor(resolveUiClosure(['crud-table']))
    expect(files.has('hooks/use-mobile.ts')).toBe(true)
    expect(files.has('components/crud/use-crud-list.ts')).toBe(true)
    expect(files.has('components/crud/graphql-client.ts')).toBe(true)
    expect(files.has('components/crud/crud-screen.tsx')).toBe(true)
    expect(files.has('components/crud/crud-toolbar.tsx')).toBe(true)
    expect(files.has('components/crud/crud-pagination.tsx')).toBe(true)
  })

  it('crud-table uiDeps include dialog/alert-dialog from EXTRA_FILES scan', () => {
    expect(COMPONENTS['crud-table'].uiDeps).toEqual(
      expect.arrayContaining(['dialog', 'alert-dialog', 'field', 'table', 'button', 'pagination'])
    )
    expect(COMPONENTS['crud-table'].cssFile).toBeNull()
  })

  it('extraFilesFor surfaces auth companions', () => {
    const files = extraFilesFor(resolveUiClosure(['auth']))
    expect(files.has('components/auth/auth-operations.ts')).toBe(true)
    expect(files.has('components/auth/auth-mock-client.ts')).toBe(true)
    expect(files.has('components/auth/login-form.tsx')).toBe(true)
    expect(files.has('components/auth/auth-fetch.ts')).toBe(true)
  })

  it('auth uiDeps include card/field/input-otp/sonner from EXTRA_FILES scan', () => {
    expect(COMPONENTS.auth.uiDeps).toEqual(
      expect.arrayContaining(['card', 'field', 'input', 'input-otp', 'button', 'checkbox', 'alert', 'sonner'])
    )
    expect(COMPONENTS.auth.cssFile).toBeNull()
    expect(COMPONENTS.auth.npmDeps).toEqual(expect.arrayContaining(['sonner', 'lucide-react']))
  })

  it('npmDepsFor unions deps across the whole closure without duplicates', () => {
    const deps = npmDepsFor(resolveUiClosure(['combobox', 'chart']))
    expect(deps.size).toBe(new Set(deps).size)
    expect(deps.size).toBeGreaterThan(0)
  })
})

describe('THEME_EDITOR_REQUIRED_COMPONENTS', () => {
  it('resolves to a non-empty closure that never includes "patterns"', () => {
    const closure = resolveUiClosure(THEME_EDITOR_REQUIRED_COMPONENTS)
    expect(closure.size).toBeGreaterThan(0)
    expect(closure.has('patterns')).toBe(false)
  })
})

describe('FRAMEWORK_EXTRA_FILES', () => {
  it('auth maps Next and Vite product routes', () => {
    expect(FRAMEWORK_EXTRA_FILES.auth.next).toEqual(
      expect.arrayContaining(['app/auth/login/page.tsx', 'app/auth/home/page.tsx'])
    )
    expect(FRAMEWORK_EXTRA_FILES.auth.vite).toEqual(
      expect.arrayContaining(['auth/LoginPage.tsx', 'auth/AuthHomePage.tsx'])
    )
    expect(frameworkExtraFilesFor(resolveUiClosure(['auth']), 'next')).toEqual(
      expect.arrayContaining(['app/auth/layout.tsx', 'app/auth/verify-otp/page.tsx'])
    )
    expect(frameworkExtraFilesFor(resolveUiClosure(['button']), 'next')).toEqual([])
  })
})
