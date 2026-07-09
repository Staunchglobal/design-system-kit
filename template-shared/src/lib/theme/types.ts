export type ThemeFieldType =
  'hex' | 'color-ref' | 'typography-ref' | 'font-ref' | 'radius-ref' | 'raw'

export type ThemeVariable = {
  /** Unique across the manifest — safe for React keys. */
  id: string
  name: string
  value: string
  fieldType: ThemeFieldType
  /** 0-based index among same `name` in the source CSS file. */
  occurrence: number
  /** Human hint: root / dark / slot / variant / size. */
  scope?: string
}

export type ThemeGroup = {
  id: string
  title: string
  kind: 'token' | 'component'
  file: string
  variables: ThemeVariable[]
}

export type ThemeManifest = {
  version: number
  groups: ThemeGroup[]
}

export type CustomColor = { name: string; hex: string }

export type CustomTypography = {
  id: string
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  letterSpacing: string
}

export type CustomFont =
  | {
      id: string
      source: 'google'
      googleFamily: string
      weights: string
    }
  | {
      id: string
      source: 'file'
      fileName: string
      /** data URL or path after save */
      dataUrl?: string
      path?: string
    }

export type ThemeEditorState = {
  values: Record<string, string>
  customColors: CustomColor[]
  customTypography: CustomTypography[]
  customFonts: CustomFont[]
  iconMap: Record<string, string>
  dirty: boolean
}

export type ThemeSavePayload = {
  values: Record<string, string>
  customColors: CustomColor[]
  customTypography: CustomTypography[]
  customFonts: CustomFont[]
  iconMap: Record<string, string>
}
