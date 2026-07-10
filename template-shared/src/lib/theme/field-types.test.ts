import { describe, expect, it } from 'vitest'
import {
  buildScopedVarsCss,
  listColorTokenNames,
  listSemanticColorTokenNames,
  scopeToSelector,
} from './field-types.js'
import type { ThemeManifest, ThemeVariable } from './types.js'

function v(overrides: Partial<ThemeVariable> & Pick<ThemeVariable, 'id' | 'name'>): ThemeVariable {
  return { value: '1px', fieldType: 'raw', occurrence: 0, ...overrides }
}

function manifestOf(groupId: string, variables: ThemeVariable[]): ThemeManifest {
  return { version: 1, groups: [{ id: groupId, title: groupId, kind: 'component', file: '', variables }] }
}

describe('listColorTokenNames', () => {
  it('includes shade steps but excludes semantic tokens that share the family prefix', () => {
    // Regression: --primary-foreground used to match a naive `startsWith('primary-')`
    // check and leak into the scale-only select alongside real steps like --primary-500.
    const manifest = manifestOf('colors', [
      v({ id: 'colors:--primary-foreground:0', name: '--primary-foreground', value: 'var(--primary-50)' }),
      v({ id: 'colors:--secondary-foreground:0', name: '--secondary-foreground', value: 'var(--secondary-900)' }),
      v({ id: 'colors:--muted-foreground:0', name: '--muted-foreground', value: 'var(--muted-500)' }),
      v({ id: 'colors:--accent-foreground:0', name: '--accent-foreground', value: 'var(--accent-900)' }),
      v({ id: 'colors:--primary-500:0', name: '--primary-500', value: '#737373', fieldType: 'hex' }),
    ])
    const names = listColorTokenNames(manifest)
    expect(names).toContain('--primary-500')
    expect(names).not.toContain('--primary-foreground')
    expect(names).not.toContain('--secondary-foreground')
    expect(names).not.toContain('--muted-foreground')
    expect(names).not.toContain('--accent-foreground')
  })
})

describe('listSemanticColorTokenNames', () => {
  it('lists names from the colors group, not scale steps', () => {
    const manifest = manifestOf('colors', [
      v({ id: 'colors:--primary:0', name: '--primary', value: 'var(--primary-900)', fieldType: 'color-ref' }),
      v({ id: 'colors:--border:0', name: '--border', value: 'var(--neutral-200)', fieldType: 'color-ref' }),
    ])
    expect(listSemanticColorTokenNames(manifest)).toEqual(['--border', '--primary'])
  })

  it('dedupes repeated occurrences (light/dark/editor scopes) of the same name', () => {
    const manifest = manifestOf('colors', [
      v({ id: 'colors:--primary:0', name: '--primary', value: 'var(--primary-900)', fieldType: 'color-ref' }),
      v({ id: 'colors:--primary:1', name: '--primary', value: 'var(--primary-200)', fieldType: 'color-ref', scope: 'dark' }),
    ])
    expect(listSemanticColorTokenNames(manifest)).toEqual(['--primary'])
  })

  it('includes extra (custom semantic color) names', () => {
    const manifest = manifestOf('colors', [])
    expect(listSemanticColorTokenNames(manifest, ['brand'])).toEqual(['--brand'])
  })
})

describe('scopeToSelector', () => {
  it('reconstructs a plain slot selector', () => {
    expect(scopeToSelector('button')).toBe('[data-slot="button"]')
  })

  it('reconstructs a slot + variant selector', () => {
    expect(scopeToSelector('button/variant=default')).toBe('[data-slot="button"][data-variant="default"]')
  })

  it('reconstructs a slot + size selector — the exact shape button.css relies on', () => {
    // This is the case that regressed: button.css's [data-size='icon'] block carries no
    // data-variant at all, so the selector must not require one.
    expect(scopeToSelector('button/size=icon')).toBe('[data-slot="button"][data-size="icon"]')
  })

  it('reconstructs a slot + variant + size selector', () => {
    expect(scopeToSelector('button/variant=link/size=default')).toBe(
      '[data-slot="button"][data-variant="link"][data-size="default"]'
    )
  })

  it('returns null for global/token scopes with no slot', () => {
    expect(scopeToSelector('root')).toBeNull()
    expect(scopeToSelector('dark')).toBeNull()
    expect(scopeToSelector('editor')).toBeNull()
    expect(scopeToSelector('default')).toBeNull()
    expect(scopeToSelector(undefined)).toBeNull()
  })

  it('strips a leading root/dark/editor marker before reading the slot', () => {
    expect(scopeToSelector('dark/bubble-content/variant=destructive')).toBe(
      '[data-slot="bubble-content"][data-variant="destructive"]'
    )
  })

  it('reconstructs an ancestor-slot descendant combinator — kbd rendered inside a tooltip', () => {
    expect(scopeToSelector('kbd/ancestor-slot=tooltip-content')).toBe(
      '[data-slot="tooltip-content"] [data-slot="kbd"]'
    )
  })

  it('reconstructs a generic non-variant/size attribute — e.g. scroll-area orientation', () => {
    expect(scopeToSelector('scroll-area-scrollbar/orientation=horizontal')).toBe(
      '[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"]'
    )
  })

  it('fans a varying attribute (from a comma-separated source rule) into a comma selector list', () => {
    // drawer's top/bottom radius rule declares the same variable across two branches —
    // the reconstructed selector must cover both, or a live edit would only ever reach one.
    expect(scopeToSelector('drawer-content/vaul-drawer-direction=top|bottom')).toBe(
      '[data-slot="drawer-content"][data-vaul-drawer-direction="top"], [data-slot="drawer-content"][data-vaul-drawer-direction="bottom"]'
    )
  })
})

describe('buildScopedVarsCss', () => {
  it('emits a selector-qualified rule for a variant-scoped variable', () => {
    const manifest = manifestOf('button', [
      v({ id: 'button:--button-bg:0', name: '--button-bg', value: 'var(--primary)', scope: 'button/variant=default' }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).toBe('[data-theme-editor] [data-slot="button"][data-variant="default"] { --button-bg: var(--primary); }')
  })

  it('emits a selector-qualified rule for a size-scoped variable with no variant qualifier', () => {
    // Regression guard for the button icon-size mislabel bug: this must NOT come out
    // requiring [data-variant="..."], since [data-size='icon'] applies to every variant.
    const manifest = manifestOf('button', [
      v({ id: 'button:--button-size:0', name: '--button-size', value: '2rem', scope: 'button/size=icon' }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).toBe('[data-theme-editor] [data-slot="button"][data-size="icon"] { --button-size: 2rem; }')
  })

  it('prefers a live edit over the manifest default', () => {
    const manifest = manifestOf('button', [
      v({ id: 'button:--button-size:0', name: '--button-size', value: '2rem', scope: 'button/size=icon' }),
    ])
    const css = buildScopedVarsCss({ 'button:--button-size:0': '4rem' }, manifest)
    expect(css).toContain('--button-size: 4rem;')
  })

  it('skips dark-scoped variables — the editor chrome always previews light', () => {
    const manifest = manifestOf('bubble-content', [
      v({
        id: 'bubble-content:--bubble-content-bg:0',
        name: '--bubble-content-bg',
        value: 'black',
        scope: 'dark/bubble-content/variant=destructive',
      }),
    ])
    expect(buildScopedVarsCss({}, manifest)).toBe('')
  })

  it('skips global/token variables entirely (they go through the ancestor-inline-var path instead)', () => {
    const manifest = manifestOf('colors', [
      v({ id: 'colors:--primary:0', name: '--primary', value: '#171717', scope: 'root' }),
    ])
    expect(buildScopedVarsCss({}, manifest)).toBe('')
  })

  it('skips a variable+selector pair when two distinct occurrences would collapse onto it', () => {
    // e.g. scroll-area's horizontal/vertical scrollbar-size, or drawer's top/bottom vs
    // left/right radius — scopeToSelector can't recover the distinguishing attribute
    // (data-orientation, data-vaul-drawer-direction), so both occurrences reconstruct
    // to the identical selector. Emitting either one would silently misrepresent the
    // other's live preview, so neither should be emitted.
    const manifest = manifestOf('scroll-area', [
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:0',
        name: '--scroll-area-scrollbar-size',
        value: '10px',
        scope: 'scroll-area-scrollbar',
      }),
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:1',
        name: '--scroll-area-scrollbar-size',
        value: '10px',
        scope: 'scroll-area-scrollbar',
      }),
    ])
    expect(buildScopedVarsCss({}, manifest)).toBe('')
  })

  it('does not let a collision on one variable name suppress an unrelated one in the same group', () => {
    const manifest = manifestOf('scroll-area', [
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:0',
        name: '--scroll-area-scrollbar-size',
        value: '10px',
        scope: 'scroll-area-scrollbar',
      }),
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:1',
        name: '--scroll-area-scrollbar-size',
        value: '10px',
        scope: 'scroll-area-scrollbar',
      }),
      v({
        id: 'scroll-area:--scroll-area-thumb-bg:0',
        name: '--scroll-area-thumb-bg',
        value: 'var(--border)',
        scope: 'scroll-area-thumb',
      }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).not.toContain('--scroll-area-scrollbar-size')
    expect(css).toContain('--scroll-area-thumb-bg: var(--border);')
  })

  it('no longer collides when scope carries the real distinguishing attribute (orientation)', () => {
    // Same variable name, but the manifest now records which orientation each occurrence
    // belongs to — they must emit as two separate, independently-editable rules.
    const manifest = manifestOf('scroll-area', [
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:0',
        name: '--scroll-area-scrollbar-size',
        value: '10px',
        scope: 'scroll-area-scrollbar/orientation=vertical',
      }),
      v({
        id: 'scroll-area:--scroll-area-scrollbar-size:1',
        name: '--scroll-area-scrollbar-size',
        value: '6px',
        scope: 'scroll-area-scrollbar/orientation=horizontal',
      }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).toContain('[data-slot="scroll-area-scrollbar"][data-orientation="vertical"] { --scroll-area-scrollbar-size: 10px; }')
    expect(css).toContain('[data-slot="scroll-area-scrollbar"][data-orientation="horizontal"] { --scroll-area-scrollbar-size: 6px; }')
  })

  it('no longer collides when scope carries an ancestor-slot (kbd bare vs. inside a tooltip)', () => {
    const manifest = manifestOf('kbd', [
      v({ id: 'kbd:--kbd-bg:0', name: '--kbd-bg', value: 'var(--muted)', scope: 'kbd' }),
      v({ id: 'kbd:--kbd-bg:1', name: '--kbd-bg', value: 'var(--background)', scope: 'kbd/ancestor-slot=tooltip-content' }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).toContain('[data-theme-editor] [data-slot="kbd"] { --kbd-bg: var(--muted); }')
    expect(css).toContain('[data-theme-editor] [data-slot="tooltip-content"] [data-slot="kbd"] { --kbd-bg: var(--background); }')
  })

  it('qualifies every branch of a fanned-out comma selector under hostSelector', () => {
    // Regression guard: hostSelector must prefix EVERY branch, not just the first —
    // otherwise the second branch would apply outside the live preview entirely.
    const manifest = manifestOf('drawer', [
      v({
        id: 'drawer:--drawer-content-radius:0',
        name: '--drawer-content-radius',
        value: 'var(--radius-lg)',
        scope: 'drawer-content/vaul-drawer-direction=top|bottom',
      }),
    ])
    const css = buildScopedVarsCss({}, manifest)
    expect(css).toBe(
      '[data-theme-editor] [data-slot="drawer-content"][data-vaul-drawer-direction="top"], ' +
        '[data-theme-editor] [data-slot="drawer-content"][data-vaul-drawer-direction="bottom"] ' +
        '{ --drawer-content-radius: var(--radius-lg); }'
    )
  })
})
