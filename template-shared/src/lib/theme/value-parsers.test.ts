import { describe, expect, it } from "vitest";
import {
  inferFieldType,
  parseTransition,
  serializeTransition,
} from "./value-parsers.js";

describe("parseTransition", () => {
  it("parses all 0.15s ease", () => {
    expect(parseTransition("all 0.15s ease")).toEqual({
      property: "all",
      duration: "0.15s",
      easing: "ease",
      compound: false,
    });
  });

  it("parses property and duration without easing", () => {
    expect(parseTransition("color 0.15s")).toEqual({
      property: "color",
      duration: "0.15s",
      easing: "ease",
      compound: false,
    });
  });

  it("rejects compound transitions", () => {
    expect(parseTransition("color 0.15s, background-color 0.15s")).toBeNull();
  });
});

describe("serializeTransition", () => {
  it("omits ease when default for non-all properties", () => {
    expect(
      serializeTransition({
        property: "color",
        duration: "0.15s",
        easing: "ease",
      })
    ).toBe("color 0.15s");
  });

  it("includes ease for all shorthand", () => {
    expect(
      serializeTransition({
        property: "all",
        duration: "0.15s",
        easing: "ease",
      })
    ).toBe("all 0.15s ease");
  });
});

describe("inferFieldType", () => {
  it("detects transparent on color vars", () => {
    expect(inferFieldType("--button-bg", "transparent")).toBe("color-keyword");
  });

  it("detects inherit on color vars", () => {
    expect(inferFieldType("--button-fg", "inherit")).toBe("color-keyword");
  });

  it("detects opacity fields", () => {
    expect(inferFieldType("--button-disabled-opacity", "0.5")).toBe("opacity");
  });

  it("detects overflow fields", () => {
    expect(inferFieldType("--aspect-ratio-overflow", "visible")).toBe(
      "overflow"
    );
  });

  it("detects border-style fields", () => {
    expect(inferFieldType("--attachment-idle-border-style", "dashed")).toBe(
      "border-style"
    );
  });

  it("detects transition fields", () => {
    expect(inferFieldType("--button-transition", "all 0.15s ease")).toBe(
      "transition"
    );
  });

  it("detects shadow-ref", () => {
    expect(inferFieldType("--chart-tooltip-shadow", "var(--shadow-xl)")).toBe(
      "shadow-ref"
    );
  });

  it("detects color-ref from component-local fg refs", () => {
    expect(
      inferFieldType("--breadcrumb-list-fg", "var(--muted-foreground)")
    ).toBe("color-ref");
  });

  it("detects radius-ref from component-local radius refs", () => {
    expect(
      inferFieldType("--input-otp-group-radius", "var(--input-radius)")
    ).toBe("radius-ref");
  });
});
