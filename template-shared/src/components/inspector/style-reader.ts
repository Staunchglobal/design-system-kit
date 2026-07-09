/**
 * Pure DOM style-reading helpers — no React. `getComputedStyle` is the single source of truth
 * for "resting" values (always exact, whatever produced the value — saved CSS or a live unsaved
 * theme-editor edit). Hover/active are best-effort since no browser lets you script a real
 * per-element pseudo-state; see readInteractiveState below for the technique and its limits.
 */

export type BoxSide = { top: string; right: string; bottom: string; left: string }
export type ColorValue = { hex: string; alpha: number } | null

export type ElementStyleSnapshot = {
  width: string
  height: string
  padding: BoxSide
  margin: BoxSide
  background: ColorValue
  color: ColorValue
  border: {
    width: BoxSide
    color: { top: ColorValue; right: ColorValue; bottom: ColorValue; left: ColorValue }
    style: string
  }
  radius: { topLeft: string; topRight: string; bottomRight: string; bottomLeft: string }
  lineHeight: string
  fontSize: string
  fontFamily: string
}

export type TargetDescription = {
  tag: string
  slot?: string
  variant?: string
  size?: string
  classes: string[]
}

export type InteractiveState = 'hover' | 'focus' | 'active'

// getComputedStyle can return rgb()/rgba() (legacy comma or modern space/slash syntax), or, for
// anything the browser doesn't normalize that way (oklch(), color(), lab() — Tailwind v4 defaults
// to oklch), something else entirely that needs the canvas round-trip below.
const RGB_RE = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i
const SENTINEL_HEX = '#010203' // arbitrary, vanishingly unlikely to collide with a real color

let scratchCtx: CanvasRenderingContext2D | null | undefined
function getScratchCtx(): CanvasRenderingContext2D | null {
  if (scratchCtx !== undefined) return scratchCtx
  if (typeof document === 'undefined') return (scratchCtx = null)
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  scratchCtx = canvas.getContext('2d')
  return scratchCtx
}

function componentsToHex(r: number, g: number, b: number, alpha: number): ColorValue {
  if (alpha <= 0) return null
  const toHex = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0')
  return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, alpha }
}

function parseAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1
  return raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw)
}

/**
 * Normalizes any CSS color string (rgb/hsl/oklch/color()/named/hex/…) to hex + alpha. Modern
 * Chromium's canvas `fillStyle` *getter* now echoes back whatever color-function string you
 * assigned (oklch() stays oklch()) instead of always normalizing to rgb() the way older engines
 * did — so round-tripping through the fillStyle string doesn't work for anything beyond what the
 * regex below already handles directly. Reading the actually-*rendered pixel bytes* instead is
 * reliable regardless of what string format the browser echoes back: cleared-to-transparent
 * canvas + a single fillRect + getImageData always yields that color's own un-premultiplied
 * RGBA, since compositing a single source-over draw onto a fully transparent destination
 * reproduces the source unchanged.
 */
export function colorToHex(cssColor: string | null | undefined): ColorValue {
  if (!cssColor) return null
  const value = cssColor.trim()
  if (value === '' || value === 'transparent' || value === 'none') return null

  const direct = value.match(RGB_RE)
  if (direct) {
    const [, r, g, b, a] = direct
    return componentsToHex(Number(r), Number(g), Number(b), parseAlpha(a))
  }

  const ctx = getScratchCtx()
  if (!ctx) return null
  try {
    ctx.fillStyle = SENTINEL_HEX
    ctx.fillStyle = value
    if (ctx.fillStyle === SENTINEL_HEX) return null // browser rejected `value` outright

    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
    return componentsToHex(r, g, b, a / 255)
  } catch {
    return null
  }
}

export function readComputedStyle(el: Element): ElementStyleSnapshot {
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  return {
    width: `${Math.round(rect.width)}px`,
    height: `${Math.round(rect.height)}px`,
    padding: { top: cs.paddingTop, right: cs.paddingRight, bottom: cs.paddingBottom, left: cs.paddingLeft },
    margin: { top: cs.marginTop, right: cs.marginRight, bottom: cs.marginBottom, left: cs.marginLeft },
    background: colorToHex(cs.backgroundColor),
    color: colorToHex(cs.color),
    border: {
      width: {
        top: cs.borderTopWidth,
        right: cs.borderRightWidth,
        bottom: cs.borderBottomWidth,
        left: cs.borderLeftWidth,
      },
      color: {
        top: colorToHex(cs.borderTopColor),
        right: colorToHex(cs.borderRightColor),
        bottom: colorToHex(cs.borderBottomColor),
        left: colorToHex(cs.borderLeftColor),
      },
      style: cs.borderTopStyle,
    },
    radius: {
      topLeft: cs.borderTopLeftRadius,
      topRight: cs.borderTopRightRadius,
      bottomRight: cs.borderBottomRightRadius,
      bottomLeft: cs.borderBottomLeftRadius,
    },
    lineHeight: cs.lineHeight,
    fontSize: cs.fontSize,
    fontFamily: cs.fontFamily,
  }
}

export function describeTarget(el: Element): TargetDescription {
  return {
    tag: el.tagName.toLowerCase(),
    slot: el.getAttribute('data-slot') ?? undefined,
    variant: el.getAttribute('data-variant') ?? undefined,
    size: el.getAttribute('data-size') ?? undefined,
    classes: (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  }
}

function readFocusState(el: Element): ElementStyleSnapshot & { supported: boolean } {
  if (!(el instanceof HTMLElement) || typeof el.focus !== 'function') {
    return { ...readComputedStyle(el), supported: false }
  }
  const previouslyFocused = document.activeElement as HTMLElement | null
  try {
    el.focus({ preventScroll: true })
    const supported = document.activeElement === el
    return { ...readComputedStyle(el), supported }
  } finally {
    el.blur()
    if (previouslyFocused && previouslyFocused !== document.body) {
      previouslyFocused.focus({ preventScroll: true })
    }
  }
}

/**
 * Real `:hover`/`:active` cannot be scripted per-element in any browser. Best-effort technique:
 * scan every stylesheet rule for a selector containing the pseudo-class, keep the ones whose
 * de-pseudo'd selector actually matches this element, substitute the pseudo for a disposable
 * marker attribute, apply that attribute, and read getComputedStyle — then clean up immediately.
 *
 * Known gaps (surfaced via the returned `supported: false` rather than a silently wrong value):
 * `.group:hover .child`-style ancestor-triggered variants (would need matching an ancestor, not
 * this element), Radix `data-[state=open]:`/`data-[highlighted]:` attribute-driven states (not a
 * real `:hover`/`:active`, not covered by this scan), and anything driven by inline JS handlers
 * rather than a real stylesheet rule.
 */
function readHoverOrActiveState(el: Element, state: 'hover' | 'active'): ElementStyleSnapshot & { supported: boolean } {
  const marker = `data-inspector-force-${state}`
  const rules: string[] = []
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let cssRules: CSSRuleList
      try {
        cssRules = sheet.cssRules
      } catch {
        continue // cross-origin stylesheet — inaccessible, skip
      }
      collectMatchingRules(cssRules, el, state, marker, rules)
    }
  } catch {
    return { ...readComputedStyle(el), supported: false }
  }

  if (!rules.length) return { ...readComputedStyle(el), supported: false }

  const scratch = document.createElement('style')
  scratch.setAttribute('data-inspector-ui', '')
  scratch.textContent = rules.join('\n')
  document.head.appendChild(scratch)
  el.setAttribute(marker, '')
  try {
    return { ...readComputedStyle(el), supported: true }
  } finally {
    el.removeAttribute(marker)
    scratch.remove()
  }
}

function collectMatchingRules(
  cssRules: CSSRuleList,
  el: Element,
  state: 'hover' | 'active',
  marker: string,
  out: string[]
): void {
  const pseudoRe = new RegExp(`:${state}\\b`, 'g')
  for (const rule of Array.from(cssRules)) {
    // @layer/@media/@supports can nest the rules we actually care about — Tailwind v4 wraps
    // essentially everything in @layer base/components/utilities, so skipping these would mean
    // finding zero hover rules in practice.
    if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
      collectMatchingRules(rule.cssRules, el, state, marker, out)
      continue
    }
    if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      collectMatchingRules(rule.cssRules, el, state, marker, out)
      continue
    }
    if (!(rule instanceof CSSStyleRule) || !rule.selectorText?.includes(`:${state}`)) continue

    const rewritten = rule.selectorText
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.includes(`:${state}`))
      .filter((part) => {
        try {
          return el.matches(part.replace(pseudoRe, ''))
        } catch {
          return false // invalid selector once stripped — skip rather than throw
        }
      })
      .map((part) => part.replace(pseudoRe, `[${marker}]`))

    if (rewritten.length) out.push(`${rewritten.join(', ')} { ${rule.style.cssText} }`)
  }
}

export function readInteractiveState(
  el: Element,
  state: InteractiveState
): ElementStyleSnapshot & { supported: boolean } {
  if (state === 'focus') return readFocusState(el)
  return readHoverOrActiveState(el, state)
}
