import { describe, expect, it } from 'vitest'
import {
  SAFE_FONT_FAMILY_RE,
  SAFE_HEX_RE,
  SAFE_ICON_KEY_RE,
  SAFE_ICON_NAME_RE,
  SAFE_TOKEN_RE,
  SAFE_WEIGHTS_RE,
  isSafeCssValue,
  isSafeCustomColorValue,
  isSafeCustomFont,
  isValidRenameTarget,
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

describe('isSafeCustomColorValue', () => {
  it('accepts a literal hex value (Color Scales page addition)', () => {
    expect(isSafeCustomColorValue('#ff5733')).toBe(true)
  })

  it('accepts a var() reference to an existing token (Colors page addition)', () => {
    expect(isSafeCustomColorValue('var(--primary-500)')).toBe(true)
    expect(isSafeCustomColorValue('var(--brand-500)')).toBe(true)
  })

  it('accepts the literal transparent keyword', () => {
    expect(isSafeCustomColorValue('transparent')).toBe(true)
  })

  it('rejects a var() reference crafted to break out of the CSS declaration', () => {
    expect(isSafeCustomColorValue('var(--x); } body{display:none} /*')).toBe(false)
    expect(isSafeCustomColorValue('var(--x)) /*')).toBe(false)
  })

  it('rejects a value that is neither a valid hex nor a valid var() reference', () => {
    expect(isSafeCustomColorValue('red')).toBe(false)
    expect(isSafeCustomColorValue('calc(1 + 1)')).toBe(false)
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

describe('isValidRenameTarget', () => {
  it('rejects an unsafe identifier', () => {
    expect(isValidRenameTarget('color', 'accent', 'in fo', [])).toMatch(/valid identifier/)
  })

  it('rejects renaming to the same name', () => {
    expect(isValidRenameTarget('color', 'accent', 'accent', [])).toMatch(/different/)
  })

  it('rejects a name reserved by a Tailwind builtin, scoped per family', () => {
    expect(isValidRenameTarget('radius', 'xl', 'full', [])).toMatch(/reserved/)
    expect(isValidRenameTarget('shadow', 'xl', 'none', [])).toMatch(/reserved/)
    expect(isValidRenameTarget('color', 'accent', 'transparent', [])).toMatch(/reserved/)
    expect(isValidRenameTarget('color', 'accent', 'full', [])).toBeNull()
  })

  it('rejects a name already used by another existing token', () => {
    expect(isValidRenameTarget('color', 'accent', 'info', ['info'])).toMatch(/already used/)
  })

  it('accepts a valid, unused, non-reserved name', () => {
    expect(isValidRenameTarget('color', 'accent', 'info', [])).toBeNull()
  })
})
