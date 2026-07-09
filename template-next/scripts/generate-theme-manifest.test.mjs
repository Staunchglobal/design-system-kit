import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { inferScope, parseVars } from './generate-theme-manifest.mjs'

describe('inferScope', () => {
  it('does not attribute a variant to a size-only rule that merely follows a variant block', () => {
    // Regression for the real bug: button.css's variant='link' block is textually the
    // last variant rule before the [data-size='icon'] block, which carries no
    // data-variant at all. Scanning the whole file backward (the old approach) picked
    // up 'link' anyway; scope must come only from the enclosing rule's own selector.
    const css = `
[data-slot='button'][data-variant='link'] {
  --button-fg: var(--primary);
}
[data-slot='button'][data-size='icon'] {
  --button-size: 2rem;
}
`
    const index = css.indexOf('--button-size')
    expect(inferScope(css, index)).toBe('button/size=icon')
  })

  it('still attributes a variant when the rule genuinely declares one', () => {
    const css = `[data-slot='button'][data-variant='default'] {\n  --button-bg: var(--primary);\n}`
    const index = css.indexOf('--button-bg')
    expect(inferScope(css, index)).toBe('button/variant=default')
  })

  it('attributes both variant and size when the same rule declares both', () => {
    const css = `[data-slot='button'][data-variant='link'][data-size='default'] {\n  --button-height: 2rem;\n}`
    const index = css.indexOf('--button-height')
    expect(inferScope(css, index)).toBe('button/variant=link/size=default')
  })

  it('tags root/dark/editor markers from the enclosing selector, nearest wins', () => {
    const css = `:root {\n  --primary: #171717;\n}\n.dark {\n  --primary: #fafafa;\n}`
    expect(inferScope(css, css.indexOf('--primary'))).toBe('root')
    expect(inferScope(css, css.lastIndexOf('--primary'))).toBe('dark')
  })

  it('falls back to "default" when the enclosing selector has no recognizable marker or slot', () => {
    const css = `.typography-h1 {\n  --typography-h1-font-size: 2rem;\n}`
    expect(inferScope(css, css.indexOf('--typography-h1-font-size'))).toBe('default')
  })

  it('captures a generic non-variant/size attribute — e.g. scroll-area orientation', () => {
    const css = `[data-slot='scroll-area-scrollbar'][data-orientation='vertical'] {\n  --scroll-area-scrollbar-size: 10px;\n}`
    expect(inferScope(css, css.indexOf('--scroll-area-scrollbar-size'))).toBe(
      'scroll-area-scrollbar/orientation=vertical'
    )
  })

  it('captures an ancestor data-slot as ancestor-slot — kbd rendered inside a tooltip', () => {
    const css = `[data-slot='tooltip-content'] [data-slot='kbd'] {\n  --kbd-bg: color-mix(in oklch, var(--background), transparent 80%);\n}`
    expect(inferScope(css, css.indexOf('--kbd-bg'))).toBe('kbd/ancestor-slot=tooltip-content')
  })

  it('collapses a varying attribute across comma-separated branches into key=value1|value2', () => {
    // This is the drawer top/bottom-vs-left/right shape: one declaration, two branches,
    // each with a different data-vaul-drawer-direction — losing either branch (the old
    // .pop()-last-match behavior) meant a live edit to one direction silently also
    // targeted the other via an identical, under-qualified reconstructed selector.
    const css = `[data-slot='drawer-content'][data-vaul-drawer-direction='top'],
[data-slot='drawer-content'][data-vaul-drawer-direction='bottom'] {
  --drawer-content-radius: var(--radius-lg);
}`
    expect(inferScope(css, css.indexOf('--drawer-content-radius'))).toBe(
      'drawer-content/vaul-drawer-direction=top|bottom'
    )
  })
})

describe('parseVars', () => {
  it('tracks occurrence per variable name independently, in source order', () => {
    const css = `
[data-slot='button'][data-variant='default'] { --button-bg: var(--primary); }
[data-slot='button'][data-variant='outline'] { --button-bg: var(--background); }
`
    const vars = parseVars(css, 'button')
    const bg = vars.filter((v) => v.name === '--button-bg')
    expect(bg.map((v) => v.occurrence)).toEqual([0, 1])
    expect(bg.map((v) => v.id)).toEqual(['button:--button-bg:0', 'button:--button-bg:1'])
    expect(bg.map((v) => v.scope)).toEqual(['button/variant=default', 'button/variant=outline'])
  })
})

// The two copies of this script (template-next and template-vite) are maintained by
// hand, not generated from a single source — a fix applied to one and not the other
// (exactly what almost happened during the live-preview bug fix) would silently ship
// only half-fixed.
describe('template-next/vite parity', () => {
  it('keeps generate-theme-manifest.mjs byte-identical between templates', () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const nextScript = fs.readFileSync(path.join(here, 'generate-theme-manifest.mjs'), 'utf8')
    const viteScript = fs.readFileSync(
      path.join(here, '../../template-vite/scripts/generate-theme-manifest.mjs'),
      'utf8'
    )
    expect(viteScript).toBe(nextScript)
  })
})
