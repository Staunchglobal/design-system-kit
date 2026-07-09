/** Word-level overrides applied when turning a kebab-case CSS var name into a human label. */
const WORD_OVERRIDES: Record<string, string> = {
  bg: 'Background',
  fg: 'Foreground',
  px: 'Horizontal Padding',
  py: 'Vertical Padding',
  otp: 'OTP',
  ui: 'UI',
  id: 'ID',
  xs: 'XS',
  sm: 'SM',
  md: 'MD',
  lg: 'LG',
  xl: 'XL',
  '2xl': '2XL',
  '3xl': '3XL',
  '4xl': '4XL',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
  h6: 'H6',
}

export function humanizeWord(word: string): string {
  const lower = word.toLowerCase()
  if (WORD_OVERRIDES[lower]) return WORD_OVERRIDES[lower]
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** `--button-hover-bg` → "Button Hover Background" */
export function humanizeVarName(name: string): string {
  const bare = name.replace(/^--/, '')
  return bare.split('-').filter(Boolean).map(humanizeWord).join(' ')
}

/** `ancestor-slot` → "Ancestor Slot"; `variant` → "Variant" */
export function humanizeKey(key: string): string {
  return key.split('-').filter(Boolean).map(humanizeWord).join(' ')
}

/**
 * A scope value can carry more than one option when the source CSS rule was a
 * comma-separated list of alternatives (see generate-theme-manifest.mjs's
 * `inferScope`) — e.g. `top|bottom`. `humanizeVarName` alone would render the
 * raw pipe verbatim ("Top|bottom"); split it into a human "or" list first.
 */
export function humanizeScopeValue(value: string): string {
  return value.split('|').map(humanizeVarName).join(' or ')
}

/** `--button-hover-bg` → "Button Hover Background (--button-hover-bg)" */
export function formatFieldLabel(name: string): string {
  return `${humanizeVarName(name)} (${name})`
}

/** `button/variant=outline/size=xs` → [{key:'variant',value:'outline'}, {key:'size',value:'xs'}] */
export function scopeConditions(scope?: string): Array<{ key: string; value: string }> {
  if (!scope) return []
  return scope
    .split('/')
    .map((segment) => {
      const eq = segment.indexOf('=')
      if (eq === -1) return null
      return { key: segment.slice(0, eq), value: segment.slice(eq + 1) }
    })
    .filter((x): x is { key: string; value: string } => x !== null)
}

/** `button/variant=outline/size=xs` → "Variant = Outline, Size = XS" */
export function humanizeScope(scope?: string): string | null {
  const conditions = scopeConditions(scope)
  if (!conditions.length) return null
  return conditions
    .map(({ key, value }) => `${humanizeKey(key)} = ${humanizeScopeValue(value)}`)
    .join(', ')
}
