import type { ThemeFieldType, ThemeManifest, ThemeVariable } from "./types";
import { inferFieldType as inferFieldTypeFromValue } from "./value-parsers";

export { inferFieldType as inferFieldTypeFromValue } from "./value-parsers";
export {
  BORDER_STYLE_OPTIONS,
  COLOR_KEYWORD_OPTIONS,
  OPACITY_OPTIONS,
  OVERFLOW_OPTIONS,
  TRANSITION_EASING_OPTIONS,
  TRANSITION_PROPERTY_OPTIONS,
  formatDurationSeconds,
  isLikelyColorVarName,
  listShadowTokenNames,
  listTokenRefNames,
  parseDurationSeconds,
  parseTransition,
  serializeTransition,
} from "./value-parsers";

export function inferFieldType(name: string, value: string): ThemeFieldType {
  return inferFieldTypeFromValue(name, value);
}

export function extractVarRef(value: string): string | null {
  const m = value.trim().match(/^var\((--[a-zA-Z0-9_-]+)(?:\s*,\s*[^)]+)?\)$/);
  return m ? m[1] : null;
}

export function toVarRef(tokenName: string): string {
  const n = tokenName.startsWith("--") ? tokenName : `--${tokenName}`;
  return `var(${n})`;
}

export function listColorTokenNames(
  manifest: ThemeManifest,
  extra: string[] = []
): string[] {
  const names = new Set<string>(["transparent"]);
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      const bare = v.name.replace(/^--/, "");
      if (
        bare.startsWith("neutral-") ||
        bare.startsWith("primary-") ||
        bare.startsWith("secondary-") ||
        bare.startsWith("accent-") ||
        bare.startsWith("muted-") ||
        bare.startsWith("destructive-")
      ) {
        names.add(v.name);
      }
    }
  }
  for (const e of extra) {
    names.add(e.startsWith("--") ? e : `--${e}`);
  }
  return [...names].sort();
}

/** Semantic color tokens (--primary, --border, --sidebar-accent, ...) — the "Colors" group,
 *  as opposed to listColorTokenNames' raw shade-scale steps ("Color Scales" group). */
export function listSemanticColorTokenNames(
  manifest: ThemeManifest,
  extra: string[] = []
): string[] {
  const names = new Set<string>();
  const colorsGroup = manifest.groups.find((g) => g.id === "colors");
  if (colorsGroup) {
    for (const v of colorsGroup.variables) names.add(v.name);
  }
  for (const e of extra) {
    names.add(e.startsWith("--") ? e : `--${e}`);
  }
  return [...names].sort();
}

export function listRadiusTokenNames(manifest: ThemeManifest): string[] {
  const names = new Set<string>();
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      const bare = v.name.replace(/^--/, "");
      if (
        bare === "radius" ||
        bare.startsWith("radius-") ||
        bare.startsWith("theme-radius")
      ) {
        names.add(v.name);
      }
    }
  }
  return [...names].sort();
}

export function listFontTokenNames(
  manifest: ThemeManifest,
  extra: string[] = []
): string[] {
  const names = new Set<string>([
    "--font-sans",
    "--font-mono",
    "--font-heading",
  ]);
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      if (v.name.startsWith("--font-")) names.add(v.name);
    }
  }
  for (const e of extra) {
    names.add(e.startsWith("--") ? e : `--${e}`);
  }
  return [...names].sort();
}

export function listTypographyTokenNames(
  manifest: ThemeManifest,
  extra: string[] = []
): string[] {
  const names = new Set<string>();
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      if (v.name.startsWith("--typography-")) names.add(v.name);
    }
  }
  for (const e of extra) {
    names.add(e.startsWith("--") ? e : `--${e}`);
  }
  return [...names].sort();
}

/** Flatten defaults from manifest into an id→value map (unique React / store keys). */
export function defaultsFromManifest(
  manifest: ThemeManifest
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      values[v.id] = v.value;
    }
  }
  return values;
}

/** Map variable id → CSS custom property name. */
export function idToNameMap(manifest: ThemeManifest): Record<string, string> {
  const map: Record<string, string> = {};
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      map[v.id] = v.name;
    }
  }
  return map;
}

/** True for `.dark { … }` token entries (live editor chrome always uses light). */
export function isDarkScopeVar(id: string, scope?: string): boolean {
  if (scope) return scope === "dark" || scope.startsWith("dark/");
  // ids look like `colors:--background:1` — occurrence ≥ 1 for colors = non-root blocks
  const parts = id.split(":");
  const occurrence = Number(parts[parts.length - 1]);
  return (
    parts[0] === "colors" && Number.isFinite(occurrence) && occurrence >= 1
  );
}

export function scopePriority(scope?: string): number {
  if (!scope || scope === "root" || scope.startsWith("root/")) return 3;
  if (scope === "editor" || scope.startsWith("editor/")) return 2;
  if (scope === "dark" || scope.startsWith("dark/")) return 0;
  return 1;
}

/**
 * Apply editor values onto an element. Values are keyed by unique variable id.
 * When several ids share a CSS name, prefer root (light), then editor, never dark.
 */
export function applyCssVars(
  values: Record<string, string>,
  nameById: Record<string, string>,
  root: HTMLElement = document.documentElement,
  scopeById?: Record<string, string | undefined>
) {
  const resolved = new Map<string, { value: string; priority: number }>();

  for (const [id, value] of Object.entries(values)) {
    const scope = scopeById?.[id];
    if (isDarkScopeVar(id, scope)) continue;
    const name = nameById[id] ?? id;
    if (!name.startsWith("--")) continue;
    const priority = scopePriority(scope);
    const prev = resolved.get(name);
    if (!prev || priority >= prev.priority) {
      resolved.set(name, { value, priority });
    }
  }

  for (const [name, { value }] of resolved) {
    root.style.setProperty(name, value);
  }
}

export function clearAppliedCssVars(
  names: string[],
  root: HTMLElement = document.documentElement
) {
  for (const name of names) {
    root.style.removeProperty(name);
  }
}

/**
 * Component CSS declares its own override vars (e.g. `--button-bg`) directly on the
 * same selector that consumes them (`[data-slot="button"][data-variant="default"]`).
 * A rule that targets an element directly always wins over a value the element only
 * *inherits* from an ancestor — so writing these via `host.style.setProperty(...)` on
 * an ancestor (what `applyCssVars` does) can never be visible live; it only becomes
 * visible once Save rewrites the literal value inside that same selector on disk.
 * Reconstruct the selector from `scope` (as produced by generate-theme-manifest.mjs's
 * `inferScope`) so these can be applied as real, higher-specificity CSS rules instead.
 * Returns null for global/token scopes (root, dark, editor, default) with no slot.
 *
 * Handles three shapes beyond a plain `slot/variant=x/size=y`:
 * - `ancestor-slot=x` — a descendant combinator (e.g. kbd inside a tooltip renders as
 *   `[data-slot="tooltip-content"] [data-slot="kbd"]`).
 * - any other `key=value` — a generic attribute qualifier (e.g. `orientation=horizontal`).
 * - `key=value1|value2` — the source rule was a comma-separated list of alternatives
 *   that all declare this variable (e.g. drawer's top/bottom vs left/right rules);
 *   fans out into a real comma-separated selector so every alternative is covered.
 */
export function scopeToSelector(scope?: string): string | null {
  if (!scope) return null;
  const parts = scope.split("/");
  if (parts[0] === "root" || parts[0] === "dark" || parts[0] === "editor")
    parts.shift();
  if (!parts.length || parts[0] === "default") return null;
  const slot = parts[0];
  if (/^[a-z-]+=/.test(slot)) return null;

  let ancestorSlot: string | null = null;
  const attrs: { key: string; values: string[] }[] = [];
  for (const part of parts.slice(1)) {
    const m = part.match(/^([a-z-]+)=(.+)$/);
    if (!m) continue;
    if (m[1] === "ancestor-slot") ancestorSlot = m[2];
    else attrs.push({ key: m[1], values: m[2].split("|") });
  }

  const prefix = ancestorSlot ? `[data-slot="${ancestorSlot}"] ` : "";
  const fixed = attrs.filter((a) => a.values.length === 1);
  const varying = attrs.find((a) => a.values.length > 1);

  let base = `${prefix}[data-slot="${slot}"]`;
  for (const { key, values } of fixed) base += `[data-${key}="${values[0]}"]`;

  if (!varying) return base;
  return varying.values
    .map((value) => `${base}[data-${varying.key}="${value}"]`)
    .join(", ");
}

/**
 * Builds selector-qualified override rules for every component-scoped variable
 * (see `scopeToSelector`), scoped under `hostSelector` so they only affect the live
 * preview. Dark-scoped entries are skipped — the editor chrome always previews light.
 *
 * A handful of variables can't be disambiguated from scope alone (e.g. two
 * occurrences whose only distinguishing DOM attribute isn't captured, or a
 * genuinely duplicate declaration) and would collapse onto the identical
 * selector+name pair. When that happens we can no longer tell which occurrence a
 * live edit belongs to, so skip emitting a rule for that pair entirely rather than
 * have one occurrence silently overwrite another's preview.
 */
export function buildScopedVarsCss(
  values: Record<string, string>,
  manifest: ThemeManifest,
  hostSelector = "[data-theme-editor]"
): string {
  const bySelectorName = new Map<
    string,
    { selector: string; name: string; value: string }[]
  >();
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      if (isDarkScopeVar(v.id, v.scope)) continue;
      const selector = scopeToSelector(v.scope);
      if (!selector) continue;
      const value = values[v.id] ?? v.value;
      const key = `${selector}|${v.name}`;
      const entries = bySelectorName.get(key) ?? [];
      entries.push({ selector, name: v.name, value });
      bySelectorName.set(key, entries);
    }
  }
  const lines: string[] = [];
  for (const entries of bySelectorName.values()) {
    if (entries.length > 1) continue;
    const { selector, name, value } = entries[0];
    // A selector may itself be a comma-separated list (see scopeToSelector's
    // `varying` branch) — hostSelector must prefix every branch, not just the first,
    // or later branches would apply unscoped, outside the live preview.
    const qualified = selector
      .split(",")
      .map((branch) => `${hostSelector} ${branch.trim()}`)
      .join(", ");
    lines.push(`${qualified} { ${name}: ${value}; }`);
  }
  return lines.join("\n");
}

const UNIT_RE = /^(-?\d+(?:\.\d+)?)(px|rem|em|%|deg|ms|s|vh|vw|vmin|vmax)$/;

/** Splits e.g. "0.375rem" into { num: 0.375, unit: 'rem' }; null if not a plain number+unit value. */
export function parseUnitValue(
  value: string
): { num: number; unit: string } | null {
  const m = value.trim().match(UNIT_RE);
  if (!m) return null;
  return { num: Number(m[1]), unit: m[2] };
}

export function isPlainNumber(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

/** Strips trailing float noise, e.g. 0.375 * 16 = 6.000000000000001 → "6". */
export function formatNumber(n: number): string {
  return String(Math.round(n * 10000) / 10000);
}

export function remToPx(rem: number): number {
  return Math.round(rem * 16 * 1000) / 1000;
}

export function pxToRem(px: number): number {
  return Math.round((px / 16) * 10000) / 10000;
}

/**
 * Flattens the manifest + live edits into name → value, preferring root scope over
 * editor/dark duplicates (same precedence as applyCssVars). Used to resolve a color
 * token reference (e.g. `--primary-500`) down to its actual hex for display.
 */
export function buildRootValueMap(
  manifest: ThemeManifest,
  values: Record<string, string>
): Record<string, string> {
  const resolved = new Map<string, { value: string; priority: number }>();
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      if (isDarkScopeVar(v.id, v.scope)) continue;
      const value = values[v.id] ?? v.value;
      const priority = scopePriority(v.scope);
      const prev = resolved.get(v.name);
      if (!prev || priority >= prev.priority) {
        resolved.set(v.name, { value, priority });
      }
    }
  }
  const out: Record<string, string> = {};
  for (const [name, { value }] of resolved) out[name] = value;
  return out;
}

/** Resolves a token name (with or without `--`) through `var(...)` chains down to a hex value. */
export function resolveTokenHex(
  token: string,
  nameValueMap: Record<string, string>,
  depth = 0
): string | null {
  if (depth > 8) return null;
  const name = token.startsWith("--") ? token : `--${token}`;
  const raw = nameValueMap[name];
  if (!raw) return null;
  const v = raw.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  const ref = v.match(/^var\((--[a-zA-Z0-9_-]+)\)$/);
  if (ref) return resolveTokenHex(ref[1], nameValueMap, depth + 1);
  return null;
}

export function groupVariablesForEditor(
  groupId: string,
  variables: ThemeVariable[]
): ThemeVariable[] {
  // Radius: only show editable theme-radius-* sources
  if (groupId === "radius") {
    return variables.filter((v) => v.name.startsWith("--theme-radius"));
  }
  // Colors: editor UI is light-only — hide .dark / [data-theme-editor] duplicates
  if (groupId === "colors") {
    return variables.filter((v) => {
      const s = v.scope ?? "";
      if (s === "dark" || s.startsWith("dark/")) return false;
      if (s === "editor" || s.startsWith("editor/")) return false;
      return true;
    });
  }
  return variables;
}
