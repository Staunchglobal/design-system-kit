import fs from "node:fs";
import path from "node:path";

export type RenameFamily = "color" | "radius" | "typography" | "shadow";

export interface RenameRequest {
  family: RenameFamily;
  from: string;
  to: string;
}

export interface RenameContext {
  cssFiles: string[];
  tsxFiles: string[];
  descriptionsPath: string | null;
}

export type FileChangeKind = "css" | "tw-class" | "data-literal" | "description";

export interface FileChange {
  path: string;
  matches: number;
  kind: FileChangeKind;
}

export interface RenamePlan {
  changes: FileChange[];
  totalMatches: number;
}

const SAFE_TOKEN_RE = /^[a-zA-Z0-9_-]+$/;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Replacement = string | ((...args: string[]) => string);
interface Rule {
  regex: RegExp;
  replacement: Replacement;
}

function cssRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case "color":
      return [
        {
          regex: new RegExp(`--${escFrom}(-foreground|-\\d+)?(?![\\w-])`, "g"),
          replacement: (_m, suffix) => `--${to}${suffix ?? ""}`,
        },
      ];
    case "radius":
      return [
        {
          regex: new RegExp(`--theme-radius-${escFrom}(?![\\w-])`, "g"),
          replacement: `--theme-radius-${to}`,
        },
        {
          regex: new RegExp(`--radius-${escFrom}(?![\\w-])`, "g"),
          replacement: `--radius-${to}`,
        },
      ];
    case "typography":
      return [
        {
          regex: new RegExp(`(\\.)?typography-${escFrom}(?![a-zA-Z0-9])`, "g"),
          replacement: (_m, dot) => `${dot ?? ""}typography-${to}`,
        },
      ];
    case "shadow":
      return [
        {
          regex: new RegExp(`--shadow-${escFrom}(?![\\w-])`, "g"),
          replacement: `--shadow-${to}`,
        },
      ];
  }
}

const CLASS_BOUNDARY = `(?=[/"'\`\\s:]|$)`;

interface TsxRule extends Rule {
  kind: FileChangeKind;
}

function tsxRulesFor(family: RenameFamily, escFrom: string, to: string): TsxRule[] {
  switch (family) {
    case "color":
      return [
        {
          kind: "tw-class",
          regex: new RegExp(
            `\\b(bg|text|border|ring|from|to|via|divide|outline|decoration|caret)-${escFrom}(-foreground)?${CLASS_BOUNDARY}`,
            "g"
          ),
          replacement: (_m, prefix, fg) => `${prefix}-${to}${fg ?? ""}`,
        },
        {
          kind: "data-literal",
          regex: new RegExp(`(cssVar:\\s*['"\`])--${escFrom}(['"\`])`, "g"),
          replacement: (_m, pre, post) => `${pre}--${to}${post}`,
        },
        {
          kind: "data-literal",
          regex: new RegExp(`(prefix:\\s*['"\`])${escFrom}(['"\`])`, "g"),
          replacement: (_m, pre, post) => `${pre}${to}${post}`,
        },
      ];
    case "radius":
      return [
        {
          kind: "tw-class",
          regex: new RegExp(`\\brounded(-[a-z]{1,2})?-${escFrom}${CLASS_BOUNDARY}`, "g"),
          replacement: (_m, dir) => `rounded${dir ?? ""}-${to}`,
        },
      ];
    case "typography":
      return [
        {
          kind: "tw-class",
          regex: new RegExp(`\\btypography-${escFrom}${CLASS_BOUNDARY}`, "g"),
          replacement: `typography-${to}`,
        },
      ];
    case "shadow":
      return [
        {
          kind: "tw-class",
          regex: new RegExp(`\\bshadow-${escFrom}${CLASS_BOUNDARY}`, "g"),
          replacement: `shadow-${to}`,
        },
      ];
  }
}

function descriptionRulesFor(family: RenameFamily, escFrom: string, to: string): Rule[] {
  switch (family) {
    case "color":
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)${escFrom}(-foreground)?\\2:`, "gm"),
          replacement: (_m, indent, _q, suffix) => `${indent}'${to}${suffix ?? ""}':`,
        },
      ];
    case "radius":
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)theme-radius-${escFrom}\\2:`, "gm"),
          replacement: (_m, indent) => `${indent}'theme-radius-${to}':`,
        },
      ];
    case "shadow":
      return [
        {
          regex: new RegExp(`^(\\s*)(['"\`]?)shadow-${escFrom}\\2:`, "gm"),
          replacement: (_m, indent) => `${indent}'shadow-${to}':`,
        },
      ];
    case "typography":
      return [];
  }
}

function applyRules(
  content: string,
  rules: Rule[]
): { newContent: string; matches: number } {
  let matches = 0;
  let newContent = content;
  for (const rule of rules) {
    const found = [...content.matchAll(rule.regex)];
    matches += found.length;
    if (found.length) {
      newContent = newContent.replace(rule.regex, rule.replacement as never);
    }
  }
  return { newContent, matches };
}

function runRename(req: RenameRequest, ctx: RenameContext, write: boolean): RenamePlan {
  if (!SAFE_TOKEN_RE.test(req.from) || !SAFE_TOKEN_RE.test(req.to)) {
    throw new Error("Rename engine called with an unsafe token name — validate before calling.");
  }
  const escFrom = escapeRegExp(req.from);
  const changes: FileChange[] = [];
  let totalMatches = 0;

  for (const filePath of ctx.cssFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const { newContent, matches } = applyRules(content, cssRulesFor(req.family, escFrom, req.to));
    if (matches > 0) {
      changes.push({ path: filePath, matches, kind: "css" });
      totalMatches += matches;
      if (write) fs.writeFileSync(filePath, newContent);
    }
  }

  for (const filePath of ctx.tsxFiles) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const rules = tsxRulesFor(req.family, escFrom, req.to);
    const byKind = new Map<FileChangeKind, number>();
    let newContent = content;
    for (const rule of rules) {
      const found = [...content.matchAll(rule.regex)];
      if (found.length) {
        newContent = newContent.replace(rule.regex, rule.replacement as never);
        byKind.set(rule.kind, (byKind.get(rule.kind) ?? 0) + found.length);
      }
    }
    for (const [kind, matches] of byKind) {
      changes.push({ path: filePath, matches, kind });
      totalMatches += matches;
    }
    if (write && newContent !== content) fs.writeFileSync(filePath, newContent);
  }

  if (ctx.descriptionsPath && fs.existsSync(ctx.descriptionsPath)) {
    const content = fs.readFileSync(ctx.descriptionsPath, "utf8");
    const { newContent, matches } = applyRules(
      content,
      descriptionRulesFor(req.family, escFrom, req.to)
    );
    if (matches > 0) {
      changes.push({ path: ctx.descriptionsPath, matches, kind: "description" });
      totalMatches += matches;
      if (write) fs.writeFileSync(ctx.descriptionsPath, newContent);
    }
  }

  return { changes, totalMatches };
}

export function planRename(req: RenameRequest, ctx: RenameContext): RenamePlan {
  return runRename(req, ctx, false);
}

export function applyRename(req: RenameRequest, ctx: RenameContext): RenamePlan {
  return runRename(req, ctx, true);
}

export interface RenamePathConfig {
  tokensDir: string;
  componentsDir: string;
  bridgeFile: string;
  uiDir: string;
  designSystemSectionsDir: string;
  descriptionsPath: string;
}

function cssFilesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => path.join(dir, f));
}

function tsxFilesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => path.join(dir, f));
}

export function buildRenameContext(cfg: RenamePathConfig): RenameContext {
  const cssFiles = [
    ...cssFilesIn(cfg.tokensDir),
    ...cssFilesIn(cfg.componentsDir),
    ...(fs.existsSync(cfg.bridgeFile) ? [cfg.bridgeFile] : []),
  ];
  const tsxFiles = [...tsxFilesIn(cfg.uiDir), ...tsxFilesIn(cfg.designSystemSectionsDir)];
  return {
    cssFiles,
    tsxFiles,
    descriptionsPath: fs.existsSync(cfg.descriptionsPath) ? cfg.descriptionsPath : null,
  };
}

export function appendRenameHistory(historyPath: string, entry: RenameRequest): void {
  let history: RenameRequest[] = [];
  if (fs.existsSync(historyPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(historyPath, "utf8")) as { renames?: RenameRequest[] };
      if (Array.isArray(data.renames)) history = data.renames;
    } catch {
      history = [];
    }
  }
  history.push(entry);
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify({ renames: history }, null, 2) + "\n");
}
