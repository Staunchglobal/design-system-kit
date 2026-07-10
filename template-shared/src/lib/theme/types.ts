export type ThemeFieldType =
  | "hex"
  | "color-ref"
  | "color-keyword"
  | "typography-ref"
  | "font-ref"
  | "radius-ref"
  | "shadow-ref"
  | "token-ref"
  | "opacity"
  | "overflow"
  | "border-style"
  | "font-weight"
  | "text-transform"
  | "font-style"
  | "scrollbar-width"
  | "easing"
  | "transition"
  | "raw";

export type ThemeVariable = {
  /** Unique across the manifest — safe for React keys. */
  id: string;
  name: string;
  value: string;
  fieldType: ThemeFieldType;
  /** 0-based index among same `name` in the source CSS file. */
  occurrence: number;
  /** Human hint: root / dark / slot / variant / size. */
  scope?: string;
};

export type ThemeGroup = {
  id: string;
  title: string;
  kind: "token" | "component";
  file: string;
  variables: ThemeVariable[];
};

export type ThemeManifest = {
  version: number;
  groups: ThemeGroup[];
  /** Recovered from tokens/fonts.css by generate-theme-manifest.mjs, so a previously
   *  saved custom font survives a reload instead of the editor starting with none. */
  customFonts?: CustomFont[];
};

/**
 * A user-registered color token. `hex` is a literal hex value for a color-scales-page
 * addition (a brand-new base swatch), or a `var(--some-scale-token)` reference for a
 * colors-page addition (a new semantic token built from an existing scale step) — `scope`
 * says which. Absent `scope` (themes saved before this field existed) means 'colors', the
 * only kind that used to exist.
 */
export type CustomColor = { name: string; hex: string; scope?: 'colors' | 'color-scales' };

export type CustomTypography = {
  id: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
};

export type CustomFont =
  | {
      id: string;
      source: "google";
      googleFamily: string;
      weights: string;
    }
  | {
      id: string;
      source: "file";
      fileName: string;
      /** data URL or path after save */
      dataUrl?: string;
      path?: string;
    };

export type ThemeEditorState = {
  values: Record<string, string>;
  customColors: CustomColor[];
  customTypography: CustomTypography[];
  customFonts: CustomFont[];
  iconMap: Record<string, string>;
  dirty: boolean;
};

export type ThemeSavePayload = {
  values: Record<string, string>;
  customColors: CustomColor[];
  customTypography: CustomTypography[];
  customFonts: CustomFont[];
  iconMap: Record<string, string>;
};
