const HEX_RE = /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/
const NUMBER_RE = /^-?\d+(\.\d+)?$/

/** `value` is the bare hex digits the user typed, without the leading `#`. */
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

/**
 * Server-side allowlists for `POST /api/theme/save` (Next) and the Vite plugin's
 * equivalent middleware — both take an arbitrary JSON payload from the client and
 * write it into files on disk, including generated .ts/.tsx source that gets
 * imported and executed, and font ids that become filesystem paths. Editing an
 * existing CSS variable's *value* is the theme editor's actual feature and is
 * already scoped inside a `property: <value>;` slot, so it's intentionally left
 * free-form (see validateRaw above); these guard the identifiers that instead
 * become selectors, property names, filenames, or literal source code, where an
 * unescaped value would let a request break out of its intended syntactic slot.
 */
export const SAFE_TOKEN_RE = /^[a-zA-Z0-9_-]+$/
export const SAFE_ICON_KEY_RE = /^[a-zA-Z][a-zA-Z0-9.-]*$/
export const SAFE_ICON_NAME_RE = /^[A-Za-z][A-Za-z0-9]*$/
export const SAFE_FONT_FAMILY_RE = /^[A-Za-z0-9 ]+$/
export const SAFE_WEIGHTS_RE = /^[0-9,; ]+$/
export const SAFE_HEX_RE = /^#[0-9a-fA-F]{3,8}$/
const SAFE_VAR_REF_RE = /^var\((--[a-zA-Z0-9_-]+)\)$/

/**
 * A custom color's value is a literal hex (added from the Color Scales page), a
 * `var(--token)` reference to an existing scale step, or the literal `transparent` keyword
 * (both added from the Colors page, which lets a new semantic token point at either) — all
 * get written verbatim into a real .css file (see ensureColorVar), so all need the same
 * break-out-of-the-declaration protection as SAFE_HEX_RE, just for their own shape.
 */
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
