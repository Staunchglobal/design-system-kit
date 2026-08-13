import { describe, expect, it } from 'vitest'
import { COMPONENTS, GROUPS } from '../generated/registry.js'
import {
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
  // Batch 7 (Layout & Chat) was the last group in the "inline component CSS" refactor —
  // every component's styling now lives in its own .tsx, so cssFile is null across the
  // board and cssFilesFor always returns an empty set. This test intentionally has no
  // "still has a real cssFile" case left to assert on; cssFilesFor itself (and the
  // cssFile field, and the CSS-copy step that consumes it) are dead code pending removal.
  it('cssFilesFor returns an empty set now that every component has cssFile: null', () => {
    const closure = resolveUiClosure(['sidebar', 'direction'])
    const files = cssFilesFor(closure)
    expect(files.size).toBe(0)
    expect(COMPONENTS.sidebar.cssFile).toBeNull()
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
    // crud-screen.css was migrated into Tailwind classes (Data Display batch) — no cssFile left.
    expect(COMPONENTS['crud-table'].cssFile).toBeNull()
  })

  it('extraFilesFor surfaces auth companions', () => {
    const files = extraFilesFor(resolveUiClosure(['auth']))
    expect(files.has('components/auth/auth-operations.ts')).toBe(true)
    expect(files.has('components/auth/auth-mock-client.ts')).toBe(true)
    expect(files.has('components/auth/login-form.tsx')).toBe(true)
    expect(files.has('components/auth/auth-fetch.ts')).toBe(true)
  })

  it('extraFilesFor surfaces chat companions', () => {
    const files = extraFilesFor(resolveUiClosure(['chat']))
    expect(files.has('components/chat/chat-inbox.tsx')).toBe(true)
    expect(files.has('components/chat/chat-mock-client.ts')).toBe(true)
    expect(files.has('components/chat/chat-operations.ts')).toBe(true)
    expect(files.has('components/chat/chat-subscribe.ts')).toBe(true)
  })

  it('auth uiDeps include field/input/sonner from EXTRA_FILES scan', () => {
    expect(COMPONENTS.auth.uiDeps).toEqual(
      expect.arrayContaining(['field', 'input', 'button', 'checkbox', 'alert', 'sonner', 'spinner'])
    )
    expect(COMPONENTS.auth.cssFile).toBeNull()
    expect(COMPONENTS.auth.npmDeps).toEqual(expect.arrayContaining(['sonner', 'lucide-react']))
  })

  it('chat uiDeps include message/bubble/sonner from EXTRA_FILES scan', () => {
    expect(COMPONENTS.chat.cssFile).toBeNull()
    expect(COMPONENTS.chat.uiDeps).toEqual(
      expect.arrayContaining([
        'sonner',
        'message',
        'bubble',
        'alert',
        'error-state',
        'spinner',
        'skeleton',
        'input-group',
        'tooltip',
      ])
    )
    expect(COMPONENTS.chat.npmDeps).toEqual(
      expect.arrayContaining(['@rails/actioncable', '@types/rails__actioncable', 'lucide-react'])
    )
  })

  it('extraFilesFor surfaces chat-search-field companion', () => {
    const files = extraFilesFor(resolveUiClosure(['chat']))
    expect(files.has('components/chat/chat-search-field.tsx')).toBe(true)
    expect(files.has('components/chat/chat-attachment-grid.tsx')).toBe(true)
  })

  it('npmDepsFor unions deps across the whole closure without duplicates', () => {
    const deps = npmDepsFor(resolveUiClosure(['combobox', 'chart']))
    expect(deps.size).toBe(new Set(deps).size)
    expect(deps.size).toBeGreaterThan(0)
  })
})

describe('FRAMEWORK_EXTRA_FILES', () => {
  it('auth maps Next and Vite product routes', () => {
    expect(FRAMEWORK_EXTRA_FILES.auth.next).toEqual(
      expect.arrayContaining(['app/(public)/login/page.tsx', 'app/(app)/dashboard/page.tsx'])
    )
    expect(FRAMEWORK_EXTRA_FILES.auth.vite).toEqual(
      expect.arrayContaining(['auth/LoginPage.tsx', 'auth/DashboardPage.tsx'])
    )
    expect(frameworkExtraFilesFor(resolveUiClosure(['auth']), 'next')).toEqual(
      expect.arrayContaining(['app/(public)/layout.tsx', 'app/(public)/reset-password/page.tsx'])
    )
    expect(frameworkExtraFilesFor(resolveUiClosure(['button']), 'next')).toEqual([])
  })

  it('chat maps Next and Vite product routes', () => {
    expect(FRAMEWORK_EXTRA_FILES.chat.next).toEqual(
      expect.arrayContaining([
        'app/(app)/layout.tsx',
        'app/(app)/chat/page.tsx',
        'app/(app)/chat/chat-app.tsx',
        'app/(app)/chat/chat-href.ts',
        'app/(app)/chat/[id]/page.tsx',
        'app/(app)/chat/archived/page.tsx',
        'app/(app)/chat/archived/[id]/page.tsx',
      ])
    )
    expect(FRAMEWORK_EXTRA_FILES.chat.vite).toEqual(
      expect.arrayContaining(['chat/ChatPage.tsx'])
    )
    expect(frameworkExtraFilesFor(resolveUiClosure(['chat']), 'next')).toEqual(
      expect.arrayContaining([
        'app/(app)/chat/page.tsx',
        'app/(app)/chat/[id]/page.tsx',
        'app/(app)/chat/archived/page.tsx',
      ])
    )
  })
})
