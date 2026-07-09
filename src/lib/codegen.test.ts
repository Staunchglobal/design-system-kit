import { describe, expect, it } from 'vitest'
import { navGroupsFor, resolveUiClosure } from './selection.js'
import {
  generateDesignSystemPage,
  generateLivePreview,
  generateNavTs,
  generateThemeIndexCss,
} from './codegen.js'

describe('generateThemeIndexCss', () => {
  it('always imports the token files, in order, regardless of selection', () => {
    const css = generateThemeIndexCss([])
    expect(css).toContain("@import './tokens/colors.css';")
    expect(css.indexOf("tokens/colors.css")).toBeLessThan(css.indexOf('tokens/radius.css'))
  })

  it('imports exactly the given component css files, nothing extra', () => {
    const css = generateThemeIndexCss(['button.css', 'dialog.css'])
    expect(css).toContain("@import './components/button.css';")
    expect(css).toContain("@import './components/dialog.css';")
    expect(css).not.toContain('combobox.css')
  })
})

describe('generateNavTs', () => {
  it('escapes single quotes in titles/labels', () => {
    const out = generateNavTs([
      { title: "Section's Name", alwaysIncluded: false, items: [{ slug: 'x', label: "It's X", demoFile: 'x.tsx', extraDemoFiles: [] }] },
    ])
    expect(out).toContain("Section\\'s Name")
    expect(out).toContain("It\\'s X")
  })

  it('round-trips a real selection into syntactically balanced output', () => {
    const groups = navGroupsFor(resolveUiClosure(['button', 'dialog']))
    const out = generateNavTs(groups)
    expect(out).toContain('export const NAV_GROUPS')
    // Every generated group object should open and close cleanly.
    expect(out.match(/\{/g)?.length).toBe(out.match(/\}/g)?.length)
  })

  it('omits a group entirely when nothing in it is selected (no empty items: [])', () => {
    const groups = navGroupsFor(resolveUiClosure(['button']))
    const out = generateNavTs(groups)
    expect(out).not.toContain('items: []')
  })
})

describe('generateDesignSystemPage', () => {
  const navGroups = navGroupsFor(resolveUiClosure(['button', 'dialog']))

  it('imports each selected item\'s demo file under a PascalCase + Demo binding', () => {
    const out = generateDesignSystemPage({
      navGroups,
      importBase: '@/app/design-system',
      sidebarImport: '@/app/design-system/_components/sidebar-nav',
      withMetadata: true,
    })
    expect(out).toContain("import ButtonDemo from '@/app/design-system/_sections/button'")
    expect(out).toContain("import DialogDemo from '@/app/design-system/_sections/dialog'")
    expect(out).toContain('<ButtonDemo />')
    expect(out).toContain('<DialogDemo />')
  })

  it('includes a Metadata export only when withMetadata is true', () => {
    const withMeta = generateDesignSystemPage({
      navGroups,
      importBase: '@/app/design-system',
      sidebarImport: '@/app/design-system/_components/sidebar-nav',
      withMetadata: true,
    })
    const withoutMeta = generateDesignSystemPage({
      navGroups,
      importBase: '@/design-system',
      sidebarImport: '@/design-system/_components/sidebar-nav',
      withMetadata: false,
    })
    expect(withMeta).toContain('export const metadata: Metadata')
    expect(withoutMeta).not.toContain('export const metadata: Metadata')
  })

  it('never imports the same demo file twice for one item', () => {
    const out = generateDesignSystemPage({
      navGroups,
      importBase: '@/app/design-system',
      sidebarImport: '@/app/design-system/_components/sidebar-nav',
      withMetadata: true,
    })
    const buttonImportCount = out.split("_sections/button'").length - 1
    expect(buttonImportCount).toBe(1)
  })
})

describe('generateLivePreview', () => {
  it('maps every selected nav item slug to its own demo module', () => {
    const navGroups = navGroupsFor(resolveUiClosure(['button', 'dialog']))
    const out = generateLivePreview({
      navGroups,
      designSystemImportBase: '@/app/design-system',
      themeEditorImportBase: '@/app/theme-editor',
    })
    expect(out).toContain("'button': ButtonDemo,")
    expect(out).toContain("'dialog': DialogDemo,")
  })

  it('aliases sonner-toast/typography-patterns manifest group ids to their real slug\'s module', () => {
    const navGroups = navGroupsFor(resolveUiClosure(['sonner']))
    const out = generateLivePreview({
      navGroups,
      designSystemImportBase: '@/app/design-system',
      themeEditorImportBase: '@/app/theme-editor',
    })
    expect(out).toContain("'sonner-toast': SonnerDemo,")
  })

  it('does not map sonner-toast to a module when sonner was never selected', () => {
    // 'sonner-toast' as a bare string always appears in the hardcoded SECTION_ID_ALIASES
    // constant (unconditional in every generated file) — what must NOT happen without sonner
    // selected is a GROUP_TO_MODULE entry pointing it at a component that was never installed.
    const navGroups = navGroupsFor(resolveUiClosure(['kbd']))
    const out = generateLivePreview({
      navGroups,
      designSystemImportBase: '@/app/design-system',
      themeEditorImportBase: '@/app/theme-editor',
    })
    expect(out).not.toContain("'sonner-toast': SonnerDemo,")
  })
})
