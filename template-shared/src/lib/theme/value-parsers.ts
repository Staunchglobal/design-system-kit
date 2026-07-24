import type { ThemeFieldType, ThemeManifest } from "./types";
import tokenFamilies from "./token-families.json";

export const OPACITY_OPTIONS = [
  "0",
  "0.1",
  "0.2",
  "0.3",
  "0.4",
  "0.5",
  "0.6",
  "0.7",
  "0.8",
  "0.9",
  "1",
] as const;

export const OVERFLOW_OPTIONS = [
  "visible",
  "hidden",
  "scroll",
  "auto",
  "clip",
] as const;

export const BORDER_STYLE_OPTIONS = [
  "none",
  "hidden",
  "solid",
  "dashed",
  "dotted",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
] as const;

export const FONT_WEIGHT_OPTIONS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
] as const;

export const TEXT_TRANSFORM_OPTIONS = [
  "none",
  "uppercase",
  "lowercase",
  "capitalize",
] as const;

export const FONT_STYLE_OPTIONS = ["normal", "italic", "oblique"] as const;

export const SCROLLBAR_WIDTH_OPTIONS = ["auto", "thin", "none"] as const;

export const TRANSITION_PROPERTY_OPTIONS = [
  "all",
  "none",
  "color",
  "background-color",
  "border-color",
  "opacity",
  "transform",
  "box-shadow",
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
] as const;

export const TRANSITION_EASING_OPTIONS = [
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "linear",
  "step-start",
  "step-end",
] as const;

export const COLOR_KEYWORD_OPTIONS = [
  "transparent",
  "inherit",
  "currentColor",
] as const;

export type ParsedTransition = {
  property: string;
  duration: string;
  easing: string;
  compound: boolean;
};

const COLOR_SEMANTIC = new Set<string>(tokenFamilies.colorSemantic);

const SHADE_PREFIXES = tokenFamilies.shadeFamilies.map((f) => `${f}-`);

const COLOR_NAME_RE =
  /(?:^|[-_])(?:bg|fg|color|fill|stroke|ring-color|border-color|shadow-color|from|to|via)(?:$|[-_])|(?:background|foreground|border(?!-style|-width|-radius)|ring|fill|stroke)/;

export function isLikelyColorVarName(name: string): boolean {
  const bare = name.replace(/^--/, "");
  if (SHADE_PREFIXES.some((p) => bare.startsWith(p))) return true;
  if (COLOR_SEMANTIC.has(bare)) return true;
  return COLOR_NAME_RE.test(bare);
}

export function parseTransition(value: string): ParsedTransition | null {
  const v = value.trim();
  if (v.includes(",")) return null;
  const m = v.match(/^(\S+)\s+(\d+(?:\.\d+)?(?:ms|s))(?:\s+(\S+))?$/);
  if (!m) return null;
  return {
    property: m[1],
    duration: m[2],
    easing: m[3] ?? "ease",
    compound: false,
  };
}

export function serializeTransition(
  parsed: Omit<ParsedTransition, "compound">
): string {
  if (parsed.easing && parsed.easing !== "ease") {
    return `${parsed.property} ${parsed.duration} ${parsed.easing}`;
  }
  if (parsed.property === "all" && parsed.easing === "ease") {
    return `${parsed.property} ${parsed.duration} ease`;
  }
  if (parsed.easing === "ease") {
    return `${parsed.property} ${parsed.duration}`;
  }
  return `${parsed.property} ${parsed.duration} ${parsed.easing}`;
}

export function parseDurationSeconds(value: string): number | null {
  const v = value.trim();
  const ms = v.match(/^(\d+(?:\.\d+)?)ms$/);
  if (ms) return Number(ms[1]) / 1000;
  const s = v.match(/^(\d+(?:\.\d+)?)s$/);
  if (s) return Number(s[1]);
  return null;
}

export function formatDurationSeconds(seconds: number): string {
  const rounded = Math.round(seconds * 1000) / 1000;
  if (rounded < 1) {
    const ms = Math.round(rounded * 1000);
    return `${ms}ms`;
  }
  return `${rounded}s`;
}

export function extractVarRefWithFallback(value: string): string | null {
  const m = value.trim().match(/^var\((--[a-zA-Z0-9_-]+)(?:\s*,\s*[^)]+)?\)$/);
  return m ? m[1] : null;
}

export function refBareToFieldType(ref: string): ThemeFieldType | null {
  const bare = ref.replace(/^--/, "");
  if (ref.startsWith("--radius") || ref.startsWith("--theme-radius"))
    return "radius-ref";
  if (ref.startsWith("--font-") || bare === "font") return "font-ref";
  if (ref.startsWith("--typography-")) return "typography-ref";
  if (ref.startsWith("--shadow-")) return "shadow-ref";
  if (
    SHADE_PREFIXES.some((p) => bare.startsWith(p)) ||
    COLOR_SEMANTIC.has(bare)
  )
    return "color-ref";
  return null;
}

export function inferFieldTypeFromName(
  name: string,
  value: string
): ThemeFieldType | null {
  const bare = name.replace(/^--/, "");
  const v = value.trim();

  if (v === "transparent" || v === "inherit" || v === "currentColor") {
    if (isLikelyColorVarName(name)) return "color-keyword";
  }
  if (bare.includes("opacity") && /^-?\d+(\.\d+)?$/.test(v)) return "opacity";
  if (
    bare.endsWith("-overflow") &&
    OVERFLOW_OPTIONS.includes(v as (typeof OVERFLOW_OPTIONS)[number])
  ) {
    return "overflow";
  }
  if (
    bare.includes("border-style") &&
    BORDER_STYLE_OPTIONS.includes(v as (typeof BORDER_STYLE_OPTIONS)[number])
  ) {
    return "border-style";
  }
  if (
    bare.endsWith("-font-weight") &&
    FONT_WEIGHT_OPTIONS.includes(v as (typeof FONT_WEIGHT_OPTIONS)[number])
  ) {
    return "font-weight";
  }
  if (
    bare.endsWith("-text-transform") &&
    TEXT_TRANSFORM_OPTIONS.includes(v as (typeof TEXT_TRANSFORM_OPTIONS)[number])
  ) {
    return "text-transform";
  }
  if (
    bare.endsWith("-font-style") &&
    FONT_STYLE_OPTIONS.includes(v as (typeof FONT_STYLE_OPTIONS)[number])
  ) {
    return "font-style";
  }
  if (
    bare.endsWith("-scrollbar-width") &&
    SCROLLBAR_WIDTH_OPTIONS.includes(v as (typeof SCROLLBAR_WIDTH_OPTIONS)[number])
  ) {
    return "scrollbar-width";
  }
  if (
    bare.endsWith("-easing") &&
    TRANSITION_EASING_OPTIONS.includes(v as (typeof TRANSITION_EASING_OPTIONS)[number])
  ) {
    return "easing";
  }
  if (bare.includes("transition") && parseTransition(v)) return "transition";

  return null;
}

export function inferFieldType(name: string, value: string): ThemeFieldType {
  const v = value.trim();

  const fromName = inferFieldTypeFromName(name, value);
  if (fromName) return fromName;

  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return "hex";

  const ref = extractVarRefWithFallback(v);
  if (ref) {
    const refType = refBareToFieldType(ref);
    if (refType) return refType;
    if (isLikelyColorVarName(ref)) return "color-ref";
    if (ref.includes("radius")) return "radius-ref";
    if (ref.startsWith("--typography-")) return "typography-ref";
    if (ref.startsWith("--font-")) return "font-ref";
    if (ref.startsWith("--shadow-")) return "shadow-ref";
    return "token-ref";
  }

  return "raw";
}

export function resolveVarFieldType(
  refName: string,
  valueByName: Record<string, string>,
  varName: string,
  visited = new Set<string>()
): ThemeFieldType | null {
  if (visited.has(refName)) return null;
  visited.add(refName);

  const direct = refBareToFieldType(refName);
  if (direct) return direct;
  if (isLikelyColorVarName(refName)) return "color-ref";
  if (refName.includes("radius")) return "radius-ref";
  if (refName.startsWith("--typography-")) return "typography-ref";
  if (refName.startsWith("--font-")) return "font-ref";
  if (refName.startsWith("--shadow-")) return "shadow-ref";

  const raw = valueByName[refName];
  if (!raw) return null;

  const fromValue = inferFieldTypeFromName(varName, raw);
  if (fromValue && fromValue !== "raw") return fromValue;

  const nested = extractVarRefWithFallback(raw);
  if (nested) return resolveVarFieldType(nested, valueByName, varName, visited);

  return inferFieldType(varName, raw) === "raw"
    ? null
    : inferFieldType(varName, raw);
}

export function listShadowTokenNames(): string[] {
  return tokenFamilies.shadowSteps.map((step) => `--shadow-${step}`);
}

export function listTokenRefNames(manifest: ThemeManifest): string[] {
  const names = new Set<string>();
  for (const g of manifest.groups) {
    for (const v of g.variables) {
      names.add(v.name);
    }
  }
  return [...names].sort();
}
