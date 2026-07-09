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
