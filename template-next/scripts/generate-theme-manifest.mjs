#!/usr/bin/env node
/**
 * Regenerates <src?>/styles/theme/theme.manifest.json from split CSS files.
 * Usage: node scripts/generate-theme-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
// Works whether the project uses a src/ directory or not (Next.js supports both).
const srcDir = fs.existsSync(path.join(root, "src")) ? "src" : ".";
let themeRoot = path.join(root, srcDir, "styles/theme");
// CLI monorepo: template-next/vite scripts run against template-shared's canonical theme.
if (!fs.existsSync(path.join(themeRoot, "tokens/colors.css"))) {
  const shared = path.join(
    root,
    "..",
    "template-shared",
    "src",
    "styles/theme"
  );
  if (fs.existsSync(path.join(shared, "tokens/colors.css"))) themeRoot = shared;
}

const COLOR_SEMANTIC = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "overlay-bg",
]);

const SHADE_PREFIXES = [
  "neutral-",
  "primary-",
  "secondary-",
  "accent-",
  "muted-",
  "destructive-",
];

const COLOR_NAME_RE =
  /(?:^|[-_])(?:bg|fg|color|fill|stroke|ring-color|border-color|shadow-color|from|to|via)(?:$|[-_])|(?:background|foreground|border(?!-style|-width|-radius)|ring|fill|stroke)/;

const OPACITY_OPTIONS = new Set([
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
]);
const OVERFLOW_OPTIONS = new Set([
  "visible",
  "hidden",
  "scroll",
  "auto",
  "clip",
]);
const BORDER_STYLE_OPTIONS = new Set([
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
]);

function isLikelyColorVarName(name) {
  const bare = name.replace(/^--/, "");
  if (SHADE_PREFIXES.some((p) => bare.startsWith(p))) return true;
  if (COLOR_SEMANTIC.has(bare)) return true;
  return COLOR_NAME_RE.test(bare);
}

function parseColorMix(value) {
  const m = value
    .trim()
    .match(
      /^color-mix\(in oklch,\s*(var\(--[a-zA-Z0-9_-]+\)|#[0-9a-fA-F]{3,8}),\s*(transparent|var\(--[a-zA-Z0-9_-]+\))\s+(\d+)%\)$/
    );
  return m ? { base: m[1], mix: m[2], percent: Number(m[3]) } : null;
}

function parseTransition(value) {
  const v = value.trim();
  if (v.includes(",")) return null;
  const m = v.match(/^(\S+)\s+(\d+(?:\.\d+)?(?:ms|s))(?:\s+(\S+))?$/);
  return m ? { property: m[1], duration: m[2], easing: m[3] ?? "ease" } : null;
}

function extractVarRefWithFallback(value) {
  const m = value.trim().match(/^var\((--[a-zA-Z0-9_-]+)(?:\s*,\s*[^)]+)?\)$/);
  return m ? m[1] : null;
}

function refBareToFieldType(ref) {
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

function inferFieldTypeFromName(name, value) {
  const bare = name.replace(/^--/, "");
  const v = value.trim();
  if (parseColorMix(v)) return "color-mix";
  if (
    (v === "transparent" || v === "inherit" || v === "currentColor") &&
    isLikelyColorVarName(name)
  ) {
    return "color-keyword";
  }
  if (bare.includes("opacity") && OPACITY_OPTIONS.has(v)) return "opacity";
  if (bare.endsWith("-overflow") && OVERFLOW_OPTIONS.has(v)) return "overflow";
  if (bare.includes("border-style") && BORDER_STYLE_OPTIONS.has(v))
    return "border-style";
  if (bare.includes("transition") && parseTransition(v)) return "transition";
  return null;
}

export function inferType(name, value) {
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

function resolveVarFieldType(
  refName,
  valueByName,
  varName,
  visited = new Set()
) {
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
  if (fromValue) return fromValue;
  const nested = extractVarRefWithFallback(raw);
  if (nested) return resolveVarFieldType(nested, valueByName, varName, visited);
  const inferred = inferType(varName, raw);
  return inferred === "raw" ? null : inferred;
}

/** Second pass: upgrade var(--local-token) fields using the full manifest value map. */
export function refineFieldTypes(groups) {
  const valueByName = new Map();
  for (const g of groups) {
    for (const v of g.variables) {
      if (!valueByName.has(v.name)) valueByName.set(v.name, v.value);
    }
  }
  const map = Object.fromEntries(valueByName);
  for (const g of groups) {
    for (const v of g.variables) {
      if (v.fieldType !== "raw") continue;
      const ref = extractVarRefWithFallback(v.value);
      if (!ref) continue;
      const resolved = resolveVarFieldType(ref, map, v.name);
      if (resolved) v.fieldType = resolved;
    }
  }
}

/**
 * Infer a short scope label from the selector of the CSS rule that directly
 * encloses the variable declaration at `index` — i.e. the text between the
 * previous rule's closing `}` and this rule's opening `{`. Scanning the whole
 * file backward (the old approach) picks up slot/variant/size attributes from
 * unrelated earlier rules — e.g. button.css's un-variant-scoped `[data-size='icon']`
 * block would inherit `variant=link` merely because `[data-variant='link']` was
 * the last variant rule textually before it, mislabeling every size-only variable.
 *
 * Captures any `[data-xxx='yyy']` attribute generically (not just variant/size), an
 * ancestor `data-slot` when the selector is a descendant combinator (e.g. kbd inside
 * a tooltip), and — when the rule's selector is a comma-separated list of alternatives
 * that all declare the same variable (e.g. drawer's top/bottom vs left/right rules) —
 * every branch, so a value that varies between them survives as `key=value1|value2`
 * instead of being silently collapsed to just the last branch.
 */
export function inferScope(css, index) {
  const before = css.slice(0, index);
  const selectorStart = before.lastIndexOf("}") + 1;
  const openBrace = before.lastIndexOf("{");
  const selector = before.slice(selectorStart, openBrace);

  const lastEditor = selector.lastIndexOf("[data-theme-editor]");
  const lastDark = selector.lastIndexOf(".dark");
  const lastRoot = selector.lastIndexOf(":root");

  const branches = selector
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const branchInfo = branches.map((branch) => {
    const slots = [...branch.matchAll(/\[data-slot=['"]([^'"]+)['"]\]/g)].map(
      (m) => m[1]
    );
    const attrs = [...branch.matchAll(/\[(data-[a-z-]+)=['"]([^'"]+)['"]\]/g)]
      .filter((m) => m[1] !== "data-slot")
      .map((m) => ({ key: m[1].slice("data-".length), value: m[2] }));
    return {
      slot: slots[slots.length - 1],
      ancestorSlot: slots.length > 1 ? slots[slots.length - 2] : null,
      attrs,
    };
  });

  const parts = [];
  // Nearest marker wins — editor light lock must not be tagged as dark
  // just because `.dark` appears earlier in the same selector text.
  const nearest = Math.max(lastEditor, lastDark, lastRoot);
  if (nearest === lastEditor && lastEditor !== -1) parts.push("editor");
  else if (nearest === lastDark && lastDark !== -1) parts.push("dark");
  else if (lastRoot !== -1) parts.push("root");

  const first = branchInfo[0];
  if (first?.slot) {
    parts.push(first.slot);
    if (first.ancestorSlot) parts.push(`ancestor-slot=${first.ancestorSlot}`);
    const keys = [...new Set(first.attrs.map((a) => a.key))];
    for (const key of keys) {
      const values = branchInfo
        .map((b) => b.attrs.find((a) => a.key === key)?.value)
        .filter(Boolean);
      parts.push(`${key}=${[...new Set(values)].join("|")}`);
    }
  }
  return parts.length ? parts.join("/") : "default";
}

export function parseVars(css, groupId) {
  const out = [];
  const occurrenceByName = new Map();
  const re = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(css))) {
    const name = m[1];
    const value = m[2].replace(/\s+/g, " ").trim();
    const occurrence = occurrenceByName.get(name) ?? 0;
    occurrenceByName.set(name, occurrence + 1);
    const scope = inferScope(css, m.index);
    const id = `${groupId}:${name}:${occurrence}`;
    out.push({
      id,
      name,
      value,
      fieldType: inferType(name, value),
      occurrence,
      scope,
    });
  }
  return out;
}

export function sectionTitle(css, fallback) {
  const m = css.match(/\/\* =+\n\s+([^\n]+)/);
  return m ? m[1].trim() : fallback;
}

/**
 * Recover the custom font list from tokens/fonts.css so the theme editor can
 * rehydrate them on reload — without this, `customFonts` state always starts
 * empty, and a subsequent Save would overwrite this file with an empty one,
 * silently deleting any font added in a previous session.
 *
 * File fonts round-trip exactly (their @font-face `font-family` IS the id).
 * Google fonts don't carry their id in the @import URL, so it's recovered by
 * matching the @import's family against the `--font-<id>: 'family', ...;` var
 * that `writeFontsCss` always writes alongside it.
 */
export function parseCustomFonts(css) {
  const fonts = [];

  const faceRe =
    /@font-face\s*\{\s*font-family:\s*'([^']+)';\s*src:\s*url\('([^']+)'\)/g;
  let m;
  while ((m = faceRe.exec(css))) {
    fonts.push({
      id: m[1],
      source: "file",
      fileName: path.basename(m[2]),
      path: m[2],
    });
  }

  const idByFamily = new Map();
  const varRe = /--font-([a-zA-Z0-9_-]+):\s*'([^']+)',\s*sans-serif;/g;
  while ((m = varRe.exec(css))) {
    idByFamily.set(m[2], m[1]);
  }

  const importRe =
    /@import url\('https:\/\/fonts\.googleapis\.com\/css2\?family=([^:]+):wght@([^&]+)&display=swap'\);/g;
  while ((m = importRe.exec(css))) {
    const family = decodeURIComponent(m[1]);
    const weights = m[2].replace(/;/g, ",");
    const id =
      idByFamily.get(family) ?? family.toLowerCase().replace(/\s+/g, "-");
    fonts.push({ id, source: "google", googleFamily: family, weights });
  }

  return fonts;
}

// Guarded so importing this module (e.g. from a test) doesn't try to read a
// theme dir that may not exist relative to the importer's cwd.
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const groups = [];
  let customFonts = [];

  const tokenFiles = [
    ["colors", "Colors", "tokens/colors.css"],
    ["radius", "Radius", "tokens/radius.css"],
    ["fonts", "Fonts", "tokens/fonts.css"],
    ["typography", "Typography", "tokens/typography.css"],
    [
      "typography-patterns",
      "Typography Patterns",
      "tokens/typography-patterns.css",
    ],
  ];

  for (const [id, title, rel] of tokenFiles) {
    const css = fs.readFileSync(path.join(themeRoot, rel), "utf8");
    groups.push({
      id,
      title,
      kind: "token",
      file: `theme/${rel}`,
      variables: parseVars(css, id),
    });
    if (id === "fonts") customFonts = parseCustomFonts(css);
  }

  const compDir = path.join(themeRoot, "components");
  for (const name of fs
    .readdirSync(compDir)
    .filter((f) => f.endsWith(".css"))
    .sort()) {
    const css = fs.readFileSync(path.join(compDir, name), "utf8");
    const id = name.replace(/\.css$/, "");
    groups.push({
      id,
      title: sectionTitle(css, id),
      kind: "component",
      file: `theme/components/${name}`,
      variables: parseVars(css, id),
    });
  }

  const manifest = { version: 1, groups, customFonts };
  refineFieldTypes(groups);
  fs.writeFileSync(
    path.join(themeRoot, "theme.manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  console.log(
    `Wrote theme.manifest.json (${groups.length} groups, ${groups.reduce(
      (n, g) => n + g.variables.length,
      0
    )} vars)`
  );
}
