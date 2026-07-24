import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyRename, planRename, type RenameContext } from "./rename-engine";

const MONOREPO_ROOT = path.resolve(__dirname, "../../../../");
const REPO_THEME_ROOT = path.join(MONOREPO_ROOT, "template-shared/src/styles/theme");
const REPO_UI_ROOT = path.join(MONOREPO_ROOT, "template-shared/src/components/ui");

let tmpDir: string;

function fixture(relPath: string, sourceAbsPath: string): string {
  const dest = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(sourceAbsPath, dest);
  return dest;
}

function writeFixture(relPath: string, content: string): string {
  const dest = path.join(tmpDir, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
  return dest;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rename-engine-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("color family rename — accent -> info (real files)", () => {
  function buildCtx(): RenameContext {
    return {
      cssFiles: [
        fixture(
          "tokens/color-scales.css",
          path.join(REPO_THEME_ROOT, "tokens/color-scales.css")
        ),
        fixture("tokens/colors.css", path.join(REPO_THEME_ROOT, "tokens/colors.css")),
        fixture(
          "components/context-menu.css",
          path.join(REPO_THEME_ROOT, "components/context-menu.css")
        ),
      ],
      tsxFiles: [
        fixture("ui/context-menu.tsx", path.join(REPO_UI_ROOT, "context-menu.tsx")),
        fixture("ui/button.tsx", path.join(REPO_UI_ROOT, "button.tsx")),
      ],
      descriptionsPath: null,
    };
  }

  it("dry-run reports matches without writing", () => {
    const ctx = buildCtx();
    const before = fs.readFileSync(ctx.cssFiles[0], "utf8");
    const plan = planRename({ family: "color", from: "accent", to: "info" }, ctx);
    expect(plan.totalMatches).toBeGreaterThan(0);
    expect(fs.readFileSync(ctx.cssFiles[0], "utf8")).toBe(before);
  });

  it("renames the shade scale, semantic slot, and every var() reference", () => {
    const ctx = buildCtx();
    applyRename({ family: "color", from: "accent", to: "info" }, ctx);

    const scales = fs.readFileSync(ctx.cssFiles[0], "utf8");
    expect(scales).toMatch(/--info-50:/);
    expect(scales).toMatch(/--info-950:/);
    expect(scales).not.toMatch(/--accent-\d+:/);

    const colors = fs.readFileSync(ctx.cssFiles[1], "utf8");
    expect(colors).toMatch(/--info:\s*var\(--info-100\);/);
    expect(colors).toMatch(/--info-foreground:\s*var\(--info-900\);/);
    expect(colors).not.toMatch(/--accent\b/);

    expect(colors).toMatch(/--sidebar-accent:\s*var\(--secondary-50\);/);
    expect(colors).toMatch(/--sidebar-accent-foreground:\s*var\(--primary-950\);/);

    expect(colors).toMatch(/--chart-5:\s*var\(--info-500\);/);
  });

  it("renames literal Tailwind utility classNames, preserving compound variants and -foreground pairing", () => {
    const ctx = buildCtx();
    applyRename({ family: "color", from: "accent", to: "info" }, ctx);
    const tsx = fs.readFileSync(ctx.tsxFiles[0], "utf8");
    expect(tsx).toMatch(/focus:bg-info focus:text-info-foreground/);
    expect(tsx).not.toMatch(/bg-accent|text-accent-foreground/);
  });

  it("never touches a cva() variant key that coincidentally shares the family name", () => {
    const ctx = buildCtx();
    const before = fs.readFileSync(ctx.tsxFiles[1], "utf8");
    expect(before).toMatch(/^\s*secondary:\s*$/m);
    applyRename({ family: "color", from: "secondary", to: "brand" }, ctx);
    const after = fs.readFileSync(ctx.tsxFiles[1], "utf8");
    expect(after).toMatch(/^\s*secondary:\s*$/m);
    expect(after).toMatch(/bg-brand text-brand-foreground/);
    expect(after).not.toMatch(/bg-secondary\b/);
  });

  it("preserves an opacity modifier suffix", () => {
    const ctx: RenameContext = {
      cssFiles: [],
      tsxFiles: [writeFixture("ui/synthetic.tsx", `className="bg-accent/20 text-accent-foreground/50"`)],
      descriptionsPath: null,
    };
    applyRename({ family: "color", from: "accent", to: "info" }, ctx);
    const out = fs.readFileSync(ctx.tsxFiles[0], "utf8");
    expect(out).toBe(`className="bg-info/20 text-info-foreground/50"`);
  });
});

describe("radius family rename — xl -> huge (real files)", () => {
  function buildCtx(): RenameContext {
    return {
      cssFiles: [fixture("tokens/radius.css", path.join(REPO_THEME_ROOT, "tokens/radius.css"))],
      tsxFiles: [
        fixture("ui/avatar.tsx", path.join(REPO_UI_ROOT, "avatar.tsx")),
        writeFixture(
          "ui/synthetic-radius.tsx",
          `className="rounded-xl rounded-t-xl rounded-full rounded-none rounded-tl-xl"`
        ),
      ],
      descriptionsPath: null,
    };
  }

  it("renames the theme-radius source and public alias, never the base --radius", () => {
    const ctx = buildCtx();
    applyRename({ family: "radius", from: "xl", to: "huge" }, ctx);
    const css = fs.readFileSync(ctx.cssFiles[0], "utf8");
    expect(css).toMatch(/--theme-radius-huge:/);
    expect(css).toMatch(/--radius-huge:\s*var\(--theme-radius-huge\);/);
    expect(css).not.toMatch(/--theme-radius-xl\b/);
    expect(css).toMatch(/--radius:\s*var\(--theme-radius\);/);
    expect(css).toMatch(/--theme-radius-2xl:/);
  });

  it("renames directional Tailwind variants but never rounded-full/rounded-none", () => {
    const ctx = buildCtx();
    applyRename({ family: "radius", from: "xl", to: "huge" }, ctx);
    const out = fs.readFileSync(ctx.tsxFiles[1], "utf8");
    expect(out).toBe(`className="rounded-huge rounded-t-huge rounded-full rounded-none rounded-tl-huge"`);
  });
});

describe("shadow family rename — xl -> jumbo (real files)", () => {
  it("renames the css var and literal Tailwind class, never shadow-inner/shadow-none", () => {
    const ctx: RenameContext = {
      cssFiles: [fixture("tokens/shadows.css", path.join(REPO_THEME_ROOT, "tokens/shadows.css"))],
      tsxFiles: [
        writeFixture("ui/synthetic-shadow.tsx", `className="shadow-xl shadow-inner shadow-none"`),
      ],
      descriptionsPath: null,
    };
    applyRename({ family: "shadow", from: "xl", to: "jumbo" }, ctx);
    const css = fs.readFileSync(ctx.cssFiles[0], "utf8");
    expect(css).toMatch(/--shadow-jumbo:/);
    expect(css).not.toMatch(/--shadow-xl\b/);
    expect(css).toMatch(/--shadow-lg:/);

    const tsx = fs.readFileSync(ctx.tsxFiles[0], "utf8");
    expect(tsx).toBe(`className="shadow-jumbo shadow-inner shadow-none"`);
  });
});

describe("typography family rename — h3 -> heading-3", () => {
  it("renames the selector, custom-prop family, and literal className", () => {
    const ctx: RenameContext = {
      cssFiles: [
        fixture("tokens/typography.css", path.join(REPO_THEME_ROOT, "tokens/typography.css")),
      ],
      tsxFiles: [
        writeFixture("ui/synthetic-typography.tsx", `<h3 className="typography-h3">Title</h3>`),
      ],
      descriptionsPath: null,
    };
    applyRename({ family: "typography", from: "h3", to: "heading-3" }, ctx);
    const css = fs.readFileSync(ctx.cssFiles[0], "utf8");
    expect(css).toMatch(/\.typography-heading-3\s*\{/);
    expect(css).toMatch(/--typography-heading-3-font-size:/);
    expect(css).not.toMatch(/typography-h3\b/);
    expect(css).toMatch(/\.typography-h4\s*\{/);

    const tsx = fs.readFileSync(ctx.tsxFiles[0], "utf8");
    expect(tsx).toBe(`<h3 className="typography-heading-3">Title</h3>`);
  });
});

describe("descriptions.ts rekeying", () => {
  it("moves a color slot's hand-written prose to the new key", () => {
    const descriptions = writeFixture(
      "lib/theme/descriptions.ts",
      `const SEMANTIC_DESCRIPTIONS: Record<string, string> = {\n` +
        `  background: 'The default page background color.',\n` +
        `  accent: 'Background color used for hover/active highlight states.',\n` +
        `  'accent-foreground': 'Text/icon color placed on top of the accent color.',\n` +
        `}\n`
    );
    const ctx: RenameContext = { cssFiles: [], tsxFiles: [], descriptionsPath: descriptions };
    const plan = applyRename({ family: "color", from: "accent", to: "info" }, ctx);
    expect(plan.totalMatches).toBe(2);
    const out = fs.readFileSync(descriptions, "utf8");
    expect(out).toContain("'info': 'Background color used for hover/active highlight states.'");
    expect(out).toContain(
      "'info-foreground': 'Text/icon color placed on top of the accent color.'"
    );
    expect(out).toContain("background: 'The default page background color.'");
  });

  it("rekeys a radius step's description", () => {
    const descriptions = writeFixture(
      "lib/theme/descriptions.ts",
      `const RADIUS_DESCRIPTIONS: Record<string, string> = {\n` +
        `  'theme-radius-xl': 'Corner radius for extra-large surfaces.',\n` +
        `}\n`
    );
    const ctx: RenameContext = { cssFiles: [], tsxFiles: [], descriptionsPath: descriptions };
    applyRename({ family: "radius", from: "xl", to: "huge" }, ctx);
    const out = fs.readFileSync(descriptions, "utf8");
    expect(out).toContain("'theme-radius-huge': 'Corner radius for extra-large surfaces.'");
  });
});

describe("planRename vs applyRename parity", () => {
  it("report the exact same match count for the same input", () => {
    const cssPath = writeFixture(
      "tokens/color-scales.css",
      `:root {\n  --accent-50: #fff;\n  --accent-500: #000;\n}\n`
    );
    const ctx: RenameContext = { cssFiles: [cssPath], tsxFiles: [], descriptionsPath: null };
    const preview = planRename({ family: "color", from: "accent", to: "info" }, ctx);
    const applied = applyRename({ family: "color", from: "accent", to: "info" }, ctx);
    expect(applied.totalMatches).toBe(preview.totalMatches);
  });
});
