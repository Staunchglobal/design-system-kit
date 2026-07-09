import { describe, expect, it } from 'vitest'
import {
  SAFE_FONT_FAMILY_RE,
  SAFE_HEX_RE,
  SAFE_ICON_KEY_RE,
  SAFE_ICON_NAME_RE,
  SAFE_TOKEN_RE,
  SAFE_WEIGHTS_RE,
  isSafeCustomFont,
} from './vite-plugin-design-kit.js'

// Mirrors template-shared/src/lib/theme/validation.test.ts — the Vite plugin can't
// import from `@/lib/theme/validation` (it's loaded by vite.config.ts outside the
// app's own alias-resolved module graph, so it deliberately duplicates these
// validators rather than importing them). Testing both copies directly guards
// against exactly the kind of drift this session already found once between
// template-next and template-vite.

describe('SAFE_TOKEN_RE (font ids, custom color names, typography ids)', () => {
  it('accepts plain identifiers', () => {
    expect(SAFE_TOKEN_RE.test('display')).toBe(true)
    expect(SAFE_TOKEN_RE.test('my-brand-font')).toBe(true)
  })

  it('rejects path traversal and separators', () => {
    expect(SAFE_TOKEN_RE.test('../../../etc/passwd')).toBe(false)
    expect(SAFE_TOKEN_RE.test('a/b')).toBe(false)
  })
})

describe('SAFE_ICON_KEY_RE / SAFE_ICON_NAME_RE', () => {
  it('accepts real semantic icon keys and Lucide export names', () => {
    expect(SAFE_ICON_KEY_RE.test('dialog.close')).toBe(true)
    expect(SAFE_ICON_NAME_RE.test('ChevronDown')).toBe(true)
  })

  it('rejects an icon value crafted to break out of a generated .ts string literal', () => {
    expect(SAFE_ICON_NAME_RE.test("X'; require('child_process'); const y='Y")).toBe(false)
  })
})

describe('SAFE_FONT_FAMILY_RE / SAFE_WEIGHTS_RE', () => {
  it('accepts real Google Fonts family names and weight lists', () => {
    expect(SAFE_FONT_FAMILY_RE.test('Fira Code')).toBe(true)
    expect(SAFE_WEIGHTS_RE.test('400;700')).toBe(true)
  })

  it('rejects a family name crafted to break out of an HTML attribute string', () => {
    expect(SAFE_FONT_FAMILY_RE.test('Inter" onerror="alert(1)')).toBe(false)
  })
})

describe('SAFE_HEX_RE', () => {
  it('accepts hex colors and rejects a CSS-breakout attempt', () => {
    expect(SAFE_HEX_RE.test('#ff5733')).toBe(true)
    expect(SAFE_HEX_RE.test('red; } body{display:none} /*')).toBe(false)
  })
})

describe('isSafeCustomFont', () => {
  it('rejects a font id crafted for path traversal — this id becomes a filename under public/fonts/', () => {
    expect(isSafeCustomFont({ id: '../../../../tmp/pwned', source: 'file', fileName: 'evil.woff2' })).toBe(false)
  })

  it('accepts a well-formed font of each source', () => {
    expect(isSafeCustomFont({ id: 'brand', source: 'file', fileName: 'brand.woff2' })).toBe(true)
    expect(
      isSafeCustomFont({ id: 'display', source: 'google', googleFamily: 'Inter', weights: '400;700' })
    ).toBe(true)
  })
})
