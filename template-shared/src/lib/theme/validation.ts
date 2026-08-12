const CSS_VALUE_BREAKOUT_RE = /[;{}]|\/\*/

/**
 * `chart.tsx` writes a caller-supplied `ChartConfig` color into a generated
 * `<style>` block (`dangerouslySetInnerHTML`) as a raw CSS custom-property value
 * (`--color-<key>: <value>;`). A value containing `;`, `{`, `}`, or a `/*`
 * comment-opener could close that declaration early and splice in unintended
 * CSS, so this blocks just the handful of characters that could end a
 * declaration early, not the rest of the value space.
 */
export function isSafeCssValue(value: string): boolean {
  return !CSS_VALUE_BREAKOUT_RE.test(value)
}
