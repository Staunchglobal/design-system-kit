import { describe, expect, it } from 'vitest'
import { isSafeCssValue } from './validation.js'

describe('isSafeCssValue', () => {
  it('accepts real theme variable values', () => {
    expect(isSafeCssValue('12px')).toBe(true)
    expect(isSafeCssValue('0 1px 2px 0 var(--neutral-950)')).toBe(true)
    expect(isSafeCssValue('italic')).toBe(true)
    expect(isSafeCssValue('all 0.15s ease')).toBe(true)
    expect(isSafeCssValue('color 0.15s, background-color 0.15s')).toBe(true)
  })

  it('rejects a value crafted to close the declaration early and inject a new CSS rule', () => {
    expect(isSafeCssValue('0} body{background:url(https://evil.example/x)} /*')).toBe(false)
  })

  it('rejects bare breakout characters', () => {
    expect(isSafeCssValue('red;')).toBe(false)
    expect(isSafeCssValue('red}')).toBe(false)
    expect(isSafeCssValue('red{')).toBe(false)
    expect(isSafeCssValue('red /* comment */')).toBe(false)
  })
})
