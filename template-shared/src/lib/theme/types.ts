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
  id: string;
  name: string;
  value: string;
  fieldType: ThemeFieldType;
  occurrence: number;
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
  customFonts?: CustomFont[];
};

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

export type RenameTokenFamily = "color" | "radius" | "typography" | "shadow";

export type RenameTokenRequest = {
  family: RenameTokenFamily;
  from: string;
  to: string;
  mode: "preview" | "apply";
};

export type RenameFileChange = {
  path: string;
  matches: number;
  kind: "css" | "tw-class" | "data-literal" | "description";
};

export type RenameTokenPlan = {
  changes: RenameFileChange[];
  totalMatches: number;
};

export type RenameTokenResponse =
  | { ok: true; plan: RenameTokenPlan; manifest?: ThemeManifest; message: string }
  | {
      ok: false;
      message: string;
      reason?: "no-op" | "invalid";
    };
