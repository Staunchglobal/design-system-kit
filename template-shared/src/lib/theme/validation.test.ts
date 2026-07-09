import { describe, expect, it } from 'vitest'
import {
  SAFE_FONT_FAMILY_RE,
  SAFE_HEX_RE,
  SAFE_ICON_KEY_RE,
  SAFE_ICON_NAME_RE,
  SAFE_TOKEN_RE,
  SAFE_WEIGHTS_RE,
  isSafeCustomFont,
} from './validation.js'

describe('SAFE_TOKEN_RE (font ids, custom color names, typography ids)', () => {
  it('accepts plain identifiers', () => {
    expect(SAFE_TOKEN_RE.test('display')).toBe(true)
    expect(SAFE_TOKEN_RE.test('my-brand-font')).toBe(true)
    expect(SAFE_TOKEN_RE.test('font_2')).toBe(true)
  })

  it('rejects path traversal and separators', () => {
    expect(SAFE_TOKEN_RE.test('../../../etc/passwd')).toBe(false)
    expect(SAFE_TOKEN_RE.test('a/b')).toBe(false)
    expect(SAFE_TOKEN_RE.test('a\\b')).toBe(false)
  })

  it('rejects characters that could break out of a generated CSS selector or file', () => {
    expect(SAFE_TOKEN_RE.test("a'; alert(1); '")).toBe(false)
    expect(SAFE_TOKEN_RE.test('a{b}')).toBe(false)
    expect(SAFE_TOKEN_RE.test('a b')).toBe(false)
  })
})

describe('SAFE_ICON_KEY_RE / SAFE_ICON_NAME_RE', () => {
  it('accepts real semantic icon keys and Lucide export names', () => {
    expect(SAFE_ICON_KEY_RE.test('dialog.close')).toBe(true)
    expect(SAFE_ICON_KEY_RE.test('breadcrumb-separator')).toBe(true)
    expect(SAFE_ICON_NAME_RE.test('ChevronDown')).toBe(true)
    expect(SAFE_ICON_NAME_RE.test('X')).toBe(true)
  })

  it('rejects an icon value crafted to break out of a generated .ts string literal', () => {
    // e.g. `'; require("child_process").execSync(...); const x='` — the exact shape
    // that would let a saved icon value execute as code once icon-map.ts is imported.
    expect(SAFE_ICON_NAME_RE.test("X'; require('child_process'); const y='Y")).toBe(false)
    expect(SAFE_ICON_KEY_RE.test("evil'; process.exit(1); //")).toBe(false)
  })
})

describe('SAFE_FONT_FAMILY_RE / SAFE_WEIGHTS_RE', () => {
  it('accepts real Google Fonts family names and weight lists', () => {
    expect(SAFE_FONT_FAMILY_RE.test('Inter')).toBe(true)
    expect(SAFE_FONT_FAMILY_RE.test('Fira Code')).toBe(true)
    expect(SAFE_WEIGHTS_RE.test('400;700')).toBe(true)
    expect(SAFE_WEIGHTS_RE.test('400,700')).toBe(true)
  })

  it('rejects a family name crafted to break out of a JSX/HTML attribute string', () => {
    // e.g. `Inter" onLoad={alert(1)} data-x="` — landed in layout.tsx's href="..." or
    // index.html's href="..." with no escaping, this is a source-code injection.
    expect(SAFE_FONT_FAMILY_RE.test('Inter" onLoad={alert(1)} data-x="')).toBe(false)
    expect(SAFE_FONT_FAMILY_RE.test("Inter'; DROP TABLE x; --")).toBe(false)
  })
})

describe('SAFE_HEX_RE', () => {
  it('accepts 3/4/6/8-digit hex colors', () => {
    expect(SAFE_HEX_RE.test('#fff')).toBe(true)
    expect(SAFE_HEX_RE.test('#ff5733')).toBe(true)
    expect(SAFE_HEX_RE.test('#ff5733aa')).toBe(true)
  })

  it('rejects a hex value crafted to break out of a CSS declaration', () => {
    expect(SAFE_HEX_RE.test('red; } body{display:none} /*')).toBe(false)
  })
})

describe('isSafeCustomFont', () => {
  it('accepts a well-formed file font', () => {
    expect(isSafeCustomFont({ id: 'brand', source: 'file', fileName: 'brand.woff2' })).toBe(true)
  })

  it('accepts a well-formed google font', () => {
    expect(isSafeCustomFont({ id: 'display', source: 'google', googleFamily: 'Inter', weights: '400;700' })).toBe(
      true
    )
  })

  it('rejects a font id crafted for path traversal — this id becomes a filename under public/fonts/', () => {
    expect(
      isSafeCustomFont({ id: '../../../../tmp/pwned', source: 'file', fileName: 'evil.woff2' })
    ).toBe(false)
  })

  it('rejects a google font whose family would break out of a JSX/HTML attribute or CSS string', () => {
    expect(
      isSafeCustomFont({
        id: 'display',
        source: 'google',
        googleFamily: 'Inter" onLoad={alert(1)} data-x="',
        weights: '400;700',
      })
    ).toBe(false)
  })

  it('rejects a google font whose weights field is not a plain weight list', () => {
    expect(
      isSafeCustomFont({ id: 'display', source: 'google', googleFamily: 'Inter', weights: '400&evil=1' })
    ).toBe(false)
  })
})
