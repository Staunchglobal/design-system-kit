import { describe, expect, it } from 'vitest'
import { humanizeKey, humanizeScope, humanizeScopeValue } from './humanize.js'

describe('humanizeKey', () => {
  it('title-cases a single word', () => {
    expect(humanizeKey('variant')).toBe('Variant')
  })

  it('splits and title-cases a hyphenated key', () => {
    expect(humanizeKey('ancestor-slot')).toBe('Ancestor Slot')
  })
})

describe('humanizeScope', () => {
  it('renders a plain variant/size scope', () => {
    expect(humanizeScope('button/variant=outline/size=xs')).toBe('Variant = Outline, Size = XS')
  })

  it('renders an ancestor-slot scope with a properly split key', () => {
    expect(humanizeScope('kbd/ancestor-slot=tooltip-content')).toBe('Ancestor Slot = Tooltip Content')
  })

  it('returns null for a scope with no conditions', () => {
    expect(humanizeScope('button')).toBeNull()
    expect(humanizeScope(undefined)).toBeNull()
  })

  it('renders a fanned-out multi-value condition as an "or" list, not a raw pipe', () => {
    expect(humanizeScope('drawer-content/vaul-drawer-direction=top|bottom')).toBe(
      'Vaul Drawer Direction = Top or Bottom'
    )
  })
})

describe('humanizeScopeValue', () => {
  it('passes a single value through humanizeVarName unchanged', () => {
    expect(humanizeScopeValue('outline')).toBe('Outline')
  })

  it('joins pipe-separated values with "or"', () => {
    expect(humanizeScopeValue('top|bottom')).toBe('Top or Bottom')
  })
})
