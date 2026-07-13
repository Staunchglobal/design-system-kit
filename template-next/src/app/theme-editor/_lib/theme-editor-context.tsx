'use client'

import * as React from 'react'
import type {
  CustomColor,
  CustomFont,
  CustomTypography,
  RenameTokenFamily,
  RenameTokenResponse,
  ThemeManifest,
  ThemeSavePayload,
} from '@/lib/theme/types'
import {
  applyCssVars,
  buildScopedVarsCss,
  defaultsFromManifest,
  idToNameMap,
  scopeToSelector,
} from '@/lib/theme/field-types'
import { defaultIconMap } from '@/components/icons/icon-map'

type ThemeEditorContextValue = {
  manifest: ThemeManifest
  /** Values keyed by unique variable id (not CSS name). */
  values: Record<string, string>
  customColors: CustomColor[]
  customTypography: CustomTypography[]
  customFonts: CustomFont[]
  iconMap: Record<string, string>
  dirty: boolean
  saving: boolean
  activeGroupId: string
  setActiveGroupId: (id: string) => void
  setValue: (variableId: string, value: string) => void
  addColor: (color: CustomColor) => void
  removeColor: (name: string) => void
  addTypography: (typo: CustomTypography) => void
  removeTypography: (id: string) => void
  addFont: (font: CustomFont) => void
  removeFont: (id: string) => void
  setIcon: (key: string, lucideName: string) => void
  reset: () => void
  save: () => Promise<{ ok: boolean; message: string }>
  exportTheme: () => void
  importTheme: (file: File) => Promise<{ ok: boolean; message: string }>
  previewRename: (req: { family: RenameTokenFamily; from: string; to: string }) => Promise<RenameTokenResponse>
  applyRename: (req: { family: RenameTokenFamily; from: string; to: string }) => Promise<RenameTokenResponse>
}

function mergeByKey<T>(prev: T[], incoming: T[], keyOf: (item: T) => string): T[] {
  const keys = new Set(incoming.map(keyOf))
  return [...prev.filter((item) => !keys.has(keyOf(item))), ...incoming]
}

const ThemeEditorContext = React.createContext<ThemeEditorContextValue | null>(null)

export function ThemeEditorProvider({
  manifest,
  children,
}: {
  manifest: ThemeManifest
  children: React.ReactNode
}) {
  const baseline = React.useMemo(() => defaultsFromManifest(manifest), [manifest])
  const nameById = React.useMemo(() => idToNameMap(manifest), [manifest])
  const scopeById = React.useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const g of manifest.groups) {
      for (const v of g.variables) {
        map[v.id] = v.scope
      }
    }
    return map
  }, [manifest])
  // Vars whose scope resolves to a component selector (e.g. `--button-bg`) must be
  // applied as real selector-qualified CSS rules, not inline vars on an ancestor —
  // see `scopeToSelector` for why inheritance can't reach them live.
  const scopedIds = React.useMemo(() => {
    const set = new Set<string>()
    for (const g of manifest.groups) {
      for (const v of g.variables) {
        if (scopeToSelector(v.scope)) set.add(v.id)
      }
    }
    return set
  }, [manifest])
  // Colors/typography that get saved are folded into the regular manifest-parsed
  // variable set on the next load (still fully editable, just no longer tracked here).
  // Fonts aren't: Save rewrites tokens/fonts.css wholesale from this state, so starting
  // empty after a reload would silently delete every previously saved font on the next
  // Save. Seed from the manifest (recovered from tokens/fonts.css) instead.
  const [values, setValues] = React.useState<Record<string, string>>(() => ({ ...baseline }))
  const [customColors, setCustomColors] = React.useState<CustomColor[]>([])
  const [customTypography, setCustomTypography] = React.useState<CustomTypography[]>([])
  const [customFonts, setCustomFonts] = React.useState<CustomFont[]>(() => manifest.customFonts ?? [])
  const [iconMap, setIconMap] = React.useState<Record<string, string>>(() => ({
    ...defaultIconMap,
  }))
  const [dirty, setDirty] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [activeGroupId, setActiveGroupId] = React.useState(() => manifest.groups[0]?.id ?? 'colors')

  React.useEffect(() => {
    // Always scope live vars to the editor host — never paint <html> (that leaks
    // dark mode into /design-system and the rest of the app).
    const host = document.querySelector('[data-theme-editor]') as HTMLElement | null
    if (!host) return

    for (const name of new Set(Object.values(nameById))) {
      if (name.startsWith('--')) {
        document.documentElement.style.removeProperty(name)
      }
    }

    const globalValues: Record<string, string> = {}
    for (const [id, v] of Object.entries(values)) {
      if (!scopedIds.has(id)) globalValues[id] = v
    }
    applyCssVars(globalValues, nameById, host, scopeById)

    const scopedStyleId = 'theme-editor-scoped-vars'
    let scopedEl = document.getElementById(scopedStyleId) as HTMLStyleElement | null
    if (!scopedEl) {
      scopedEl = document.createElement('style')
      scopedEl.id = scopedStyleId
      document.head.appendChild(scopedEl)
    }
    scopedEl.textContent = buildScopedVarsCss(values, manifest)
  }, [values, nameById, scopeById, scopedIds, manifest])

  // Inject preview style for custom colors / fonts / typography
  React.useEffect(() => {
    const id = 'theme-editor-dynamic'
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = id
      document.head.appendChild(el)
    }
    const colorRules = customColors
      .map((c) => {
        const name = c.name.startsWith('--') ? c.name : `--${c.name}`
        return `${name}: ${c.hex};`
      })
      .join('\n')
    const fontFaces = customFonts
      .filter(
        (f): f is Extract<CustomFont, { source: 'file' }> => f.source === 'file' && !!f.dataUrl
      )
      .map((f) => `@font-face{font-family:'${f.id}';src:url('${f.dataUrl}');font-display:swap;}`)
      .join('\n')
    const fontVars = customFonts
      .map((f) => {
        if (f.source === 'google') {
          return `--font-${f.id}: '${f.googleFamily}', sans-serif;`
        }
        return `--font-${f.id}: '${f.id}', sans-serif;`
      })
      .join('\n')
    const typoRules = customTypography
      .map((t) => {
        const id = t.id.replace(/^typography-/, '')
        return `.typography-${id}{
  font-family: ${t.fontFamily};
  font-size: ${t.fontSize};
  font-weight: ${t.fontWeight};
  line-height: ${t.lineHeight};
  letter-spacing: ${t.letterSpacing};
}
--typography-${id}-font-family: ${t.fontFamily};
--typography-${id}-font-size: ${t.fontSize};
--typography-${id}-font-weight: ${t.fontWeight};
--typography-${id}-line-height: ${t.lineHeight};
--typography-${id}-letter-spacing: ${t.letterSpacing};`
      })
      .join('\n')

    const googleLinks = customFonts
      .filter((f): f is Extract<CustomFont, { source: 'google' }> => f.source === 'google')
      .map((f) => {
        const family = encodeURIComponent(f.googleFamily)
        const weights = f.weights || '400;700'
        return `@import url('https://fonts.googleapis.com/css2?family=${family}:wght@${weights.replace(/,/g, ';')}&display=swap');`
      })
      .join('\n')

    el.textContent = `${googleLinks}
${fontFaces}
:root {
${colorRules}
${fontVars}
${customTypography
  .map((t) => {
    const id = t.id.replace(/^typography-/, '')
    return `--typography-${id}-font-family: ${t.fontFamily};
--typography-${id}-font-size: ${t.fontSize};
--typography-${id}-font-weight: ${t.fontWeight};
--typography-${id}-line-height: ${t.lineHeight};
--typography-${id}-letter-spacing: ${t.letterSpacing};`
  })
  .join('\n')}
}
${typoRules}`
  }, [customColors, customFonts, customTypography])

  const setValue = React.useCallback((variableId: string, value: string) => {
    setValues((prev) => ({ ...prev, [variableId]: value }))
    setDirty(true)
  }, [])

  const addColor = React.useCallback((color: CustomColor) => {
    setCustomColors((prev) => [...prev.filter((c) => c.name !== color.name), color])
    setDirty(true)
  }, [])

  // Only removes a color added earlier *this session* and not yet saved — once saved,
  // a custom color is folded into the regular manifest-parsed variable set (see the
  // state-init comment above) and this can no longer target it.
  const removeColor = React.useCallback((name: string) => {
    setCustomColors((prev) => prev.filter((c) => c.name !== name))
    setDirty(true)
  }, [])

  const addTypography = React.useCallback((typo: CustomTypography) => {
    setCustomTypography((prev) => [...prev.filter((t) => t.id !== typo.id), typo])
    setDirty(true)
  }, [])

  // Same pending-only caveat as removeColor — typography has no persistent "custom"
  // marker either, so this only ever targets this session's not-yet-saved additions.
  const removeTypography = React.useCallback((id: string) => {
    setCustomTypography((prev) => prev.filter((t) => t.id !== id))
    setDirty(true)
  }, [])

  const addFont = React.useCallback((font: CustomFont) => {
    setCustomFonts((prev) => [...prev.filter((f) => f.id !== font.id), font])
    setDirty(true)
  }, [])

  // Fonts round-trip persistently (manifest.customFonts, seeded above), so unlike
  // removeColor/removeTypography this also removes an already-saved custom font —
  // Save wholesale-rewrites tokens/fonts.css from customFonts, so the next save drops it.
  const removeFont = React.useCallback((id: string) => {
    setCustomFonts((prev) => prev.filter((f) => f.id !== id))
    setDirty(true)
  }, [])

  const setIcon = React.useCallback((key: string, lucideName: string) => {
    setIconMap((prev) => ({ ...prev, [key]: lucideName }))
    setDirty(true)
  }, [])

  const reset = React.useCallback(() => {
    setValues({ ...baseline })
    setCustomColors([])
    setCustomTypography([])
    // Back to what's on disk, not empty — an empty array here would delete every
    // previously saved font on the very next Save (see the state init above).
    setCustomFonts(manifest.customFonts ?? [])
    setIconMap({ ...defaultIconMap })
    setDirty(false)
    const host = document.querySelector('[data-theme-editor]') as HTMLElement | null
    if (host) {
      const globalValues: Record<string, string> = {}
      for (const [id, v] of Object.entries(baseline)) {
        if (!scopedIds.has(id)) globalValues[id] = v
      }
      applyCssVars(globalValues, nameById, host, scopeById)
    }
    const scopedEl = document.getElementById('theme-editor-scoped-vars') as HTMLStyleElement | null
    if (scopedEl) scopedEl.textContent = buildScopedVarsCss(baseline, manifest)
  }, [baseline, nameById, scopeById, scopedIds, manifest])

  const save = React.useCallback(async () => {
    setSaving(true)
    try {
      const payload: ThemeSavePayload = {
        values,
        customColors,
        customTypography,
        customFonts,
        iconMap,
      }
      const res = await fetch('/api/theme/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { ok: boolean; message: string }
      if (data.ok) setDirty(false)
      return data
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'Save failed' }
    } finally {
      setSaving(false)
    }
  }, [values, customColors, customTypography, customFonts, iconMap])

  const exportTheme = React.useCallback(() => {
    const payload: ThemeSavePayload = {
      values,
      customColors,
      customTypography,
      customFonts,
      iconMap,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'theme-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [values, customColors, customTypography, customFonts, iconMap])

  const importTheme = React.useCallback(
    async (file: File) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(await file.text())
      } catch {
        return { ok: false, message: 'That file is not valid JSON.' }
      }
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, message: 'That file does not look like a theme export.' }
      }
      const payload = parsed as Partial<ThemeSavePayload>
      const validIds = new Set(Object.keys(nameById))
      const entries = Object.entries(payload.values ?? {}).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string' && validIds.has(entry[0])
      )
      const hasColors = Array.isArray(payload.customColors) && payload.customColors.length > 0
      const hasTypography =
        Array.isArray(payload.customTypography) && payload.customTypography.length > 0
      const hasFonts = Array.isArray(payload.customFonts) && payload.customFonts.length > 0
      const hasIcons = payload.iconMap && typeof payload.iconMap === 'object'

      if (!entries.length && !hasColors && !hasTypography && !hasFonts && !hasIcons) {
        return { ok: false, message: 'No matching variables found in that file.' }
      }

      if (entries.length) {
        setValues((prev) => {
          const next = { ...prev }
          for (const [id, v] of entries) next[id] = v
          return next
        })
      }
      if (hasColors) {
        setCustomColors((prev) => mergeByKey(prev, payload.customColors!, (c) => c.name))
      }
      if (hasTypography) {
        setCustomTypography((prev) => mergeByKey(prev, payload.customTypography!, (t) => t.id))
      }
      if (hasFonts) {
        setCustomFonts((prev) => mergeByKey(prev, payload.customFonts!, (f) => f.id))
      }
      if (hasIcons) {
        setIconMap((prev) => ({ ...prev, ...payload.iconMap }))
      }
      setDirty(true)

      return {
        ok: true,
        message: `Imported ${entries.length} variable${entries.length === 1 ? '' : 's'}. Click Save to write it to disk.`,
      }
    },
    [nameById]
  )

  const previewRename = React.useCallback(
    async (req: { family: RenameTokenFamily; from: string; to: string }): Promise<RenameTokenResponse> => {
      const res = await fetch('/api/theme/rename-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, mode: 'preview' }),
      })
      return (await res.json()) as RenameTokenResponse
    },
    []
  )

  const applyRename = React.useCallback(
    async (req: { family: RenameTokenFamily; from: string; to: string }): Promise<RenameTokenResponse> => {
      const res = await fetch('/api/theme/rename-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req, mode: 'apply' }),
      })
      const data = (await res.json()) as RenameTokenResponse
      // Renamed vars get new manifest ids — reload so the server re-reads the fresh
      // manifest rather than trying to patch a live id->name map in place.
      if (data.ok) window.location.reload()
      return data
    },
    []
  )

  const value: ThemeEditorContextValue = {
    manifest,
    values,
    customColors,
    customTypography,
    customFonts,
    iconMap,
    dirty,
    saving,
    activeGroupId,
    setActiveGroupId,
    setValue,
    addColor,
    removeColor,
    addTypography,
    removeTypography,
    addFont,
    removeFont,
    setIcon,
    reset,
    save,
    exportTheme,
    importTheme,
    previewRename,
    applyRename,
  }

  return <ThemeEditorContext.Provider value={value}>{children}</ThemeEditorContext.Provider>
}

export function useThemeEditor() {
  const ctx = React.useContext(ThemeEditorContext)
  if (!ctx) throw new Error('useThemeEditor must be used within ThemeEditorProvider')
  return ctx
}
