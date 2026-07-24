import tokenFamilies from './token-families.json'

const HEX_RE = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/
const NUMBER_RE = /^-?\d+(\.\d+)?$/

export function validateHex(value: string): string | null {
  if (!HEX_RE.test(value.trim())) {
    return 'Enter a valid hex color without the # — e.g. ff5733.'
  }
  return null
}

export function validateNumber(value: string, unitLabel?: string): string | null {
  if (!NUMBER_RE.test(value.trim())) {
    return unitLabel
      ? `Enter a number for this ${unitLabel} value — e.g. 12.`
      : 'Enter a valid number — e.g. 12.'
  }
  return null
}

export function validateRaw(value: string): string | null {
  const v = value.trim()
  if (!v) return "This value can't be empty."
  const opens = (v.match(/\(/g) ?? []).length
  const closes = (v.match(/\)/g) ?? []).length
  if (opens !== closes) return "Check the value — parentheses don't match."
  return null
}

export const SAFE_TOKEN_RE = /^[a-zA-Z0-9_-]+$/
export const SAFE_ICON_KEY_RE = /^[a-zA-Z][a-zA-Z0-9.-]*$/
export const SAFE_ICON_NAME_RE = /^[A-Za-z][A-Za-z0-9]*$/
export const SAFE_FONT_FAMILY_RE = /^[A-Za-z0-9 ]+$/
export const SAFE_WEIGHTS_RE = /^[0-9,; ]+$/
export const SAFE_HEX_RE = /^#[0-9a-fA-F]{3,8}$/
const SAFE_VAR_REF_RE = /^var\((--[a-zA-Z0-9_-]+)\)$/
const CSS_VALUE_BREAKOUT_RE = /[;{}]|\/\*/

export function isSafeCssValue(value: string): boolean {
  return !CSS_VALUE_BREAKOUT_RE.test(value)
}

export function isSafeCustomColorValue(value: string): boolean {
  if (SAFE_HEX_RE.test(value) || value === 'transparent') return true
  const m = value.match(SAFE_VAR_REF_RE)
  return m !== null && SAFE_TOKEN_RE.test(m[1].replace(/^--/, ''))
}

type SanitizableCustomFont =
  | { id: string; source: 'google'; googleFamily: string; weights: string }
  | { id: string; source: 'file'; fileName: string; dataUrl?: string; path?: string }

export function isSafeCustomFont(f: SanitizableCustomFont): boolean {
  if (!SAFE_TOKEN_RE.test(f.id)) return false
  if (f.source === 'google') return SAFE_FONT_FAMILY_RE.test(f.googleFamily) && SAFE_WEIGHTS_RE.test(f.weights || '')
  return true
}

export type RenameFamily = 'color' | 'radius' | 'typography' | 'shadow'

export function isValidRenameTarget(
  family: RenameFamily,
  from: string,
  to: string,
  existingNames: string[]
): string | null {
  if (!SAFE_TOKEN_RE.test(to)) {
    return 'Enter a valid identifier — letters, numbers, hyphens, and underscores only.'
  }
  if (to === from) return 'The new name must be different from the current name.'
  const reserved =
    family === 'color'
      ? tokenFamilies.reservedWords.color
      : family === 'radius'
        ? tokenFamilies.reservedWords.radius
        : family === 'shadow'
          ? tokenFamilies.reservedWords.shadow
          : []
  if ((reserved as string[]).includes(to)) {
    return `"${to}" is reserved by Tailwind's own utilities and can't be used here.`
  }
  if (existingNames.includes(to)) {
    return `"${to}" is already used by another token.`
  }
  return null
}
