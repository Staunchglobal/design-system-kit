import type { ThemeGroup, ThemeVariable } from './types'
import { humanizeKey, humanizeScopeValue, humanizeVarName, scopeConditions } from './humanize'
import tokenFamilies from './token-families.json'

// Sourced from token-families.json — the canonical registry, shared with
// generate-theme-manifest.mjs and value-parsers.ts so the family list never drifts.
const SHADE_FAMILY_RE = new RegExp(`^(${tokenFamilies.shadeFamilies.join('|')})-(\\d+)$`)

const SEMANTIC_DESCRIPTIONS: Record<string, string> = {
  background: 'The default page background color.',
  foreground: 'The default text color used on top of the background.',
  card: 'Background color for card surfaces (Card, Dialog panels, etc.).',
  'card-foreground': 'Text color used inside card surfaces.',
  popover: 'Background color for floating surfaces like popovers and menus.',
  'popover-foreground': 'Text color used inside popovers and menus.',
  primary: 'The main brand color, used for primary buttons and highlighted elements.',
  'primary-foreground': 'Text/icon color placed on top of the primary color.',
  secondary: 'A supporting color used for secondary buttons and less prominent actions.',
  'secondary-foreground': 'Text/icon color placed on top of the secondary color.',
  muted: 'A subdued background color used for low-emphasis surfaces.',
  'muted-foreground': 'Subdued text color used for secondary or helper text.',
  accent: 'Background color used for hover/active highlight states.',
  'accent-foreground': 'Text/icon color placed on top of the accent color.',
  destructive: 'Color used for destructive actions and error states (e.g. delete buttons).',
  border: 'Default border color used across components.',
  input: 'Border color used specifically for form input fields.',
  ring: 'Color of the focus ring shown around focused elements.',
  'chart-1': 'Color for the 1st data series in charts.',
  'chart-2': 'Color for the 2nd data series in charts.',
  'chart-3': 'Color for the 3rd data series in charts.',
  'chart-4': 'Color for the 4th data series in charts.',
  'chart-5': 'Color for the 5th data series in charts.',
  sidebar: 'Background color of the sidebar navigation.',
  'sidebar-foreground': 'Text color used inside the sidebar.',
  'sidebar-primary': 'Primary/highlight color used inside the sidebar.',
  'sidebar-primary-foreground': 'Text/icon color placed on top of the sidebar primary color.',
  'sidebar-accent': 'Hover/active highlight color inside the sidebar.',
  'sidebar-accent-foreground': 'Text/icon color placed on top of the sidebar accent color.',
  'sidebar-border': 'Border color used inside the sidebar.',
  'sidebar-ring': 'Focus ring color used inside the sidebar.',
  'overlay-bg': 'Background color of the dark overlay shown behind modals, dialogs, and sheets.',
  'shadow-sm': 'Box shadow used for subtle elevation (small).',
  'shadow-md': 'Box shadow used for medium elevation.',
  'shadow-lg': 'Box shadow used for large elevation.',
  'shadow-xl': 'Box shadow used for the largest elevation.',
}

const RADIUS_DESCRIPTIONS: Record<string, string> = {
  'theme-radius': 'The base corner radius every other radius size is derived from.',
  'theme-radius-sm': 'Corner radius for small elements (e.g. badges, checkboxes).',
  'theme-radius-md': 'Corner radius for medium elements (e.g. buttons, inputs).',
  'theme-radius-lg': 'Corner radius for large elements (e.g. cards, dialogs).',
  'theme-radius-xl': 'Corner radius for extra-large surfaces.',
  'theme-radius-2xl': 'Corner radius for 2XL surfaces.',
  'theme-radius-3xl': 'Corner radius for 3XL surfaces.',
  'theme-radius-4xl': 'Corner radius for the largest surfaces.',
}

const SHADE_LEVEL_HINT: Record<string, string> = {
  '0': 'the absolute lightest extreme (pure white for neutral)',
  '50': 'the lightest tone',
  '100': 'a very light tone',
  '200': 'a light tone',
  '300': 'a light-mid tone',
  '400': 'a mid-light tone',
  '500': 'the base tone',
  '600': 'a mid-dark tone',
  '700': 'a dark tone',
  '800': 'a very dark tone',
  '900': 'a near-black tone',
  '950': 'the darkest tone',
}

const TYPOGRAPHY_PROPERTY_DESCRIPTIONS: Record<string, string> = {
  'font-family': 'Font family',
  'font-size': 'Font size',
  'font-weight': 'Font weight',
  'line-height': 'Line height',
  'letter-spacing': 'Letter spacing',
}

const MULTI_WORD_PROPERTIES: Array<[string[], string]> = [
  [['font', 'size'], 'Font size'],
  [['font', 'weight'], 'Font weight'],
  [['line', 'height'], 'Line height'],
  [['letter', 'spacing'], 'Letter spacing'],
  [['border', 'width'], 'Border thickness'],
  [['border', 'color'], 'Border color'],
  [['ring', 'color'], 'Focus ring color'],
  [['ring', 'width'], 'Focus ring thickness'],
  [['padding', 'x'], 'Horizontal padding'],
  [['padding', 'y'], 'Vertical padding'],
  [['underline', 'offset'], 'Underline offset distance'],
  [['icon', 'size'], 'Icon size'],
  [['disabled', 'opacity'], 'Opacity when disabled'],
]

const SINGLE_WORD_PROPERTIES: Record<string, string> = {
  bg: 'Background color',
  fg: 'Text color',
  foreground: 'Text color',
  color: 'Color',
  border: 'Border color',
  ring: 'Focus ring color',
  radius: 'Corner radius',
  padding: 'Padding',
  gap: 'Spacing between child items',
  size: 'Width and height',
  width: 'Width',
  height: 'Height',
  opacity: 'Opacity',
  shadow: 'Box shadow',
  transition: 'Transition timing',
  offset: 'Offset distance',
  weight: 'Weight',
  scale: 'Scale factor',
  duration: 'Animation duration',
  easing: 'Animation easing curve',
  indent: 'Indent distance',
  thickness: 'Thickness',
  blur: 'Blur amount',
}

const STATE_WORDS = new Set([
  'hover',
  'focus',
  'disabled',
  'checked',
  'open',
  'invalid',
  'active',
  'selected',
  'placeholder',
  'dragging',
  'indeterminate',
  'expanded',
  'loading',
])

const PART_WORDS = new Set([
  'thumb',
  'track',
  'icon',
  'label',
  'header',
  'content',
  'item',
  'trigger',
  'close',
  'arrow',
  'chevron',
  'separator',
  'dot',
  'handle',
  'scrollbar',
  'indicator',
  'panel',
  'viewport',
  'list',
  'group',
  'row',
  'cell',
  'tab',
  'marker',
  'avatar',
  'badge',
  'caret',
  'check',
  'overlay',
  'backdrop',
])

function describeComponentVariable(bare: string, group: ThemeGroup): string {
  const words = bare.split('-').filter(Boolean)

  let propertyPhrase: string | null = null
  let remainder = words

  for (const [seq, phrase] of MULTI_WORD_PROPERTIES) {
    if (words.length < seq.length) continue
    const tail = words.slice(words.length - seq.length)
    if (tail.join(',') === seq.join(',')) {
      propertyPhrase = phrase
      remainder = words.slice(0, words.length - seq.length)
      break
    }
  }

  if (!propertyPhrase) {
    const last = words[words.length - 1]
    if (last && SINGLE_WORD_PROPERTIES[last]) {
      propertyPhrase = SINGLE_WORD_PROPERTIES[last]
      remainder = words.slice(0, -1)
    }
  }

  // Drop a leading word that's just the component's own slug (e.g. "button" in "button-hover-bg").
  const groupWords = new Set(group.id.split('-'))
  while (remainder.length && groupWords.has(remainder[0])) {
    remainder = remainder.slice(1)
  }

  const states = remainder.filter((w) => STATE_WORDS.has(w))
  const parts = remainder.filter((w) => PART_WORDS.has(w))
  const leftover = remainder.filter((w) => !STATE_WORDS.has(w) && !PART_WORDS.has(w))

  const base = propertyPhrase ?? `The "${humanizeVarName(remainder.join('-') || bare)}" value`
  let sentence = `${base} for the ${group.title} component`
  if (parts.length) sentence += `'s ${parts.map(humanizeVarName).join(' ')}`
  if (leftover.length && propertyPhrase) sentence += ` (${leftover.map(humanizeVarName).join(' ')})`
  if (states.length) sentence += ` in the ${states.map(humanizeVarName).join(' / ')} state`
  sentence += '.'
  return sentence
}

export function describeVariable(variable: ThemeVariable, group: ThemeGroup): string {
  const bare = variable.name.replace(/^--/, '')
  let sentence: string

  if (group.id === 'colors' && SEMANTIC_DESCRIPTIONS[bare]) {
    sentence = SEMANTIC_DESCRIPTIONS[bare]
  } else if (group.id === 'colors') {
    sentence = `A ${humanizeVarName(bare)} color value.`
  } else if (group.id === 'color-scales') {
    const shade = bare.match(SHADE_FAMILY_RE)
    if (shade) {
      const [, family, level] = shade
      const hint = SHADE_LEVEL_HINT[level] ?? `step ${level}`
      sentence = `Step ${level} of the ${humanizeVarName(family)} color scale — ${hint}. Referenced by semantic tokens above; not usually edited directly.`
    } else {
      sentence = `A ${humanizeVarName(bare)} color value.`
    }
  } else if (group.id === 'shadows' && SEMANTIC_DESCRIPTIONS[bare]) {
    sentence = SEMANTIC_DESCRIPTIONS[bare]
  } else if (group.id === 'shadows') {
    sentence = `Box shadow value ("${humanizeVarName(bare)}").`
  } else if (group.id === 'radius' && RADIUS_DESCRIPTIONS[bare]) {
    sentence = RADIUS_DESCRIPTIONS[bare]
  } else if (group.id === 'fonts') {
    if (bare === 'font-heading') {
      sentence = 'Font family used for headings — points at another font token (e.g. --font-sans).'
    } else if (bare === 'font-sans') {
      sentence = 'The default sans-serif font family used for body text.'
    } else if (bare === 'font-mono') {
      sentence = 'The monospace font family used for code and mono text.'
    } else {
      sentence = `Custom font family token ("${bare.replace(/^font-/, '')}").`
    }
  } else if (group.id === 'typography' || group.id === 'typography-patterns') {
    const m = bare.match(
      /^typography-([a-z0-9]+)-(font-family|font-size|font-weight|line-height|letter-spacing)$/
    )
    if (m) {
      const [, variant, prop] = m
      sentence = `${TYPOGRAPHY_PROPERTY_DESCRIPTIONS[prop]} for the "${variant}" typography style (applied via the \`.typography-${variant}\` utility class).`
    } else {
      sentence = `Typography token controlling "${humanizeVarName(bare)}".`
    }
  } else {
    sentence = describeComponentVariable(bare, group)
  }

  const conditions = scopeConditions(variable.scope)
  if (conditions.length) {
    const text = conditions
      .map(({ key, value }) => `${humanizeKey(key)} = "${humanizeScopeValue(value)}"`)
      .join(', ')
    sentence += ` Applies when ${text}.`
  }

  return sentence
}
