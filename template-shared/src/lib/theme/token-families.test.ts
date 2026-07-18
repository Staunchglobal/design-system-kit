import { describe, expect, it } from "vitest";
import tokenFamilies from "./token-families.json";
import { isLikelyColorVarName, listShadowTokenNames } from "./value-parsers";

// Locks in the Phase 1 registry refactor: COLOR_SEMANTIC/SHADE_PREFIXES/shadow steps
// now derive from token-families.json instead of 4+ independently hardcoded copies
// (value-parsers.ts, both generate-theme-manifest.mjs scripts, descriptions.ts). These
// tests assert the derived behavior is unchanged from before the refactor.

describe("token-families.json", () => {
  it("has the expected shape", () => {
    expect(tokenFamilies.colorSemantic).toContain("background");
    expect(tokenFamilies.colorSemantic).toContain("destructive");
    expect(tokenFamilies.shadeFamilies).toEqual([
      "neutral",
      "primary",
      "secondary",
      "accent",
      "muted",
      "destructive",
      "success",
      "warning",
      "info",
    ]);
    expect(tokenFamilies.colorSemantic).toEqual(
      expect.arrayContaining([
        "success",
        "success-foreground",
        "warning",
        "warning-foreground",
        "info",
        "info-foreground",
      ])
    );
    expect(tokenFamilies.radiusSteps).toEqual([
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
    ]);
    expect(tokenFamilies.shadowSteps).toEqual(["xs", "sm", "md", "lg", "xl"]);
  });

  it("reservedWords covers the Tailwind-builtin collision risks per family", () => {
    expect(tokenFamilies.reservedWords.color).toEqual(
      expect.arrayContaining(["transparent", "current", "inherit"])
    );
    expect(tokenFamilies.reservedWords.radius).toEqual(
      expect.arrayContaining(["none", "full"])
    );
    expect(tokenFamilies.reservedWords.shadow).toEqual(
      expect.arrayContaining(["none", "inner"])
    );
  });
});

describe("isLikelyColorVarName (registry-derived)", () => {
  it("recognizes every registered semantic slot", () => {
    for (const slot of tokenFamilies.colorSemantic) {
      expect(isLikelyColorVarName(`--${slot}`)).toBe(true);
    }
  });

  it("recognizes a shade step for every registered family", () => {
    for (const family of tokenFamilies.shadeFamilies) {
      expect(isLikelyColorVarName(`--${family}-500`)).toBe(true);
    }
  });

  it("does not misclassify an unrelated component-local var", () => {
    expect(isLikelyColorVarName("--button-gap")).toBe(false);
  });
});

describe("listShadowTokenNames (registry-derived)", () => {
  it("derives one --shadow-{step} name per registered shadow step", () => {
    expect(listShadowTokenNames()).toEqual(
      tokenFamilies.shadowSteps.map((step) => `--shadow-${step}`)
    );
  });
});
