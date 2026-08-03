import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
  isValidRenameTargetInline,
} from './vite-plugin-design-kit.js'

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

describe('isValidRenameTargetInline', () => {
  let tmpDir: string
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rename-validate-test-'))
  })
  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('rejects an unsafe identifier', () => {
    expect(isValidRenameTargetInline('color', 'accent', 'in fo', [], tmpDir)).toMatch(/valid identifier/)
  })

  it('rejects renaming to the same name', () => {
    expect(isValidRenameTargetInline('color', 'accent', 'accent', [], tmpDir)).toMatch(/different/)
  })

  it('rejects a name reserved by a Tailwind builtin, per family, via the registry file', () => {
    fs.mkdirSync(path.join(tmpDir, 'src/lib/theme'), { recursive: true })
    fs.writeFileSync(
      path.join(tmpDir, 'src/lib/theme/token-families.json'),
      JSON.stringify({ reservedWords: { color: ['transparent'], radius: ['full'], typography: [], shadow: ['none'] } })
    )
    expect(isValidRenameTargetInline('radius', 'xl', 'full', [], tmpDir)).toMatch(/reserved/)
    expect(isValidRenameTargetInline('shadow', 'xl', 'none', [], tmpDir)).toMatch(/reserved/)
  })

  it('rejects a name already used by another existing token', () => {
    expect(isValidRenameTargetInline('color', 'accent', 'info', ['info'], tmpDir)).toMatch(/already used/)
  })

  it('accepts a valid, unused, non-reserved name', () => {
    expect(isValidRenameTargetInline('color', 'accent', 'info', [], tmpDir)).toBeNull()
  })
})
