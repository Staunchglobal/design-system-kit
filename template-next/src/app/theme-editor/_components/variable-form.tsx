'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { NativeSelect } from '@/components/ui/native-select'
import { SmartField } from '@/app/theme-editor/_components/smart-field'
import { useThemeEditor } from '@/app/theme-editor/_lib/theme-editor-context'
import { groupVariablesForEditor, listColorTokenNames, toVarRef } from '@/lib/theme/field-types'
import { lucideIconNames, resolveLucideIcon } from '@/components/icons/icon'
import { defaultIconMap } from '@/components/icons/icon-map'
import { validateHex } from '@/lib/theme/validation'

export function VariableForm() {
  const {
    manifest,
    activeGroupId,
    addColor,
    addTypography,
    addFont,
    setIcon,
    iconMap,
    customColors,
    customTypography,
    customFonts,
  } = useThemeEditor()

  if (activeGroupId === 'icons') {
    return <IconsPanel iconMap={iconMap} setIcon={setIcon} />
  }

  const group = manifest.groups.find((g) => g.id === activeGroupId)
  if (!group) {
    return <div className="text-muted-foreground p-4 text-sm">Unknown group</div>
  }

  const variables = groupVariablesForEditor(group.id, group.variables)

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b p-4">
        <h2 className="typography-h5">{group.title}</h2>
        <p className="text-muted-foreground typography-caption mt-1 font-mono">{group.file}</p>
        <p className="text-muted-foreground mt-1 text-xs">{variables.length} variables</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {group.id === 'color-scales' && (
            <AddColorForm
              onAdd={(c) => addColor({ ...c, scope: 'color-scales' })}
              existing={customColors.map((c) => c.name)}
            />
          )}
          {group.id === 'colors' && (
            <AddColorRefForm
              manifest={manifest}
              customColors={customColors}
              onAdd={(c) => addColor({ ...c, scope: 'colors' })}
              existing={customColors.map((c) => c.name)}
            />
          )}
          {group.id === 'typography' && (
            <AddTypographyForm onAdd={addTypography} existing={customTypography.map((t) => t.id)} />
          )}
          {group.id === 'fonts' && (
            <AddFontForm onAdd={addFont} existing={customFonts.map((f) => f.id)} />
          )}
          {variables.map((v) => (
            <SmartField key={v.id} variable={v} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AddColorForm({
  onAdd,
  existing,
}: {
  onAdd: (c: { name: string; hex: string }) => void
  existing: string[]
}) {
  const [name, setName] = React.useState('')
  const [hexDigits, setHexDigits] = React.useState('6366f1')
  const [hexTouched, setHexTouched] = React.useState(false)
  const hexError = hexTouched ? validateHex(hexDigits) : null
  const hex = `#${hexDigits}`
  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="typography-small mb-2 font-medium">Add color</div>
      <p className="text-muted-foreground mb-2 text-xs">
        Registers a brand-new color token you can then reference from any component field.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Name</Label>
          <Input
            placeholder="brand-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-36 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Hex</Label>
          <InputGroup className="h-8 w-32">
            <InputGroupAddon align="inline-start">
              <InputGroupText className="font-mono">#</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              value={hexDigits}
              spellCheck={false}
              aria-invalid={!!hexError || undefined}
              onChange={(e) => setHexDigits(e.target.value.replace(/^#/, ''))}
              onBlur={() => setHexTouched(true)}
              className="font-mono text-xs"
            />
            <InputGroupAddon align="inline-end">
              <input
                type="color"
                value={/^[0-9a-fA-F]{6}$/.test(hexDigits) ? hex : '#000000'}
                onChange={(e) => setHexDigits(e.target.value.replace(/^#/, ''))}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Pick color"
              />
            </InputGroupAddon>
          </InputGroup>
          {hexError && <FieldError className="w-32">{hexError}</FieldError>}
        </div>
        <Button
          size="sm"
          disabled={!!validateHex(hexDigits)}
          onClick={() => {
            const n = name.trim().replace(/^--/, '')
            if (!n || existing.includes(n) || existing.includes(`--${n}`)) return
            if (validateHex(hexDigits)) return
            onAdd({ name: n, hex })
            setName('')
          }}
        >
          Add
        </Button>
      </div>
    </div>
  )
}

function AddColorRefForm({
  manifest,
  customColors,
  onAdd,
  existing,
}: {
  manifest: import('@/lib/theme/types').ThemeManifest
  customColors: { name: string; hex: string; scope?: 'colors' | 'color-scales' }[]
  onAdd: (c: { name: string; hex: string }) => void
  existing: string[]
}) {
  const scaleTokens = React.useMemo(() => {
    const extra = customColors
      .filter((c) => c.scope === 'color-scales')
      .map((c) => (c.name.startsWith('--') ? c.name : `--${c.name}`))
    return listColorTokenNames(manifest, extra)
  }, [manifest, customColors])
  const [name, setName] = React.useState('')
  const [scaleToken, setScaleToken] = React.useState(scaleTokens[0] ?? 'transparent')

  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="typography-small mb-2 font-medium">Add color</div>
      <p className="text-muted-foreground mb-2 text-xs">
        Registers a new semantic color token that points at an existing color scale step.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Name</Label>
          <Input
            placeholder="brand"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-36 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Color scale</Label>
          <NativeSelect
            className="h-8 w-44 font-mono text-xs"
            value={scaleToken}
            onChange={(e) => setScaleToken(e.target.value)}
          >
            {scaleTokens.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const n = name.trim().replace(/^--/, '')
            if (!n || existing.includes(n) || existing.includes(`--${n}`)) return
            const value = scaleToken === 'transparent' ? 'transparent' : toVarRef(scaleToken)
            onAdd({ name: n, hex: value })
            setName('')
          }}
        >
          Add
        </Button>
      </div>
    </div>
  )
}

function AddTypographyForm({
  onAdd,
  existing,
}: {
  onAdd: (t: {
    id: string
    fontFamily: string
    fontSize: string
    fontWeight: string
    lineHeight: string
    letterSpacing: string
  }) => void
  existing: string[]
}) {
  const [id, setId] = React.useState('')
  const [fontFamily, setFontFamily] = React.useState('var(--font-sans)')
  const [fontSize, setFontSize] = React.useState('0.875rem')
  const [fontWeight, setFontWeight] = React.useState('500')
  const [lineHeight, setLineHeight] = React.useState('1.25')
  const [letterSpacing, setLetterSpacing] = React.useState('0')
  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="typography-small mb-2 font-medium">Add typography role</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-xs">Name</Label>
          <Input
            placeholder="eyebrow"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Font family</Label>
          <Input
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Size</Label>
          <Input
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Weight</Label>
          <Input
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Line height</Label>
          <Input
            value={lineHeight}
            onChange={(e) => setLineHeight(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Letter spacing</Label>
          <Input
            value={letterSpacing}
            onChange={(e) => setLetterSpacing(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
      </div>
      <Button
        size="sm"
        className="mt-2"
        onClick={() => {
          const n = id.trim().replace(/^typography-/, '')
          if (!n || existing.includes(n) || existing.includes(`typography-${n}`)) return
          onAdd({
            id: n,
            fontFamily,
            fontSize,
            fontWeight,
            lineHeight,
            letterSpacing,
          })
          setId('')
        }}
      >
        Add typography
      </Button>
    </div>
  )
}

function AddFontForm({
  onAdd,
  existing,
}: {
  onAdd: (
    f:
      | { id: string; source: 'google'; googleFamily: string; weights: string }
      | { id: string; source: 'file'; fileName: string; dataUrl?: string }
  ) => void
  existing: string[]
}) {
  const [id, setId] = React.useState('')
  const [mode, setMode] = React.useState<'google' | 'file'>('google')
  const [googleFamily, setGoogleFamily] = React.useState('Inter')
  const [weights, setWeights] = React.useState('400;700')
  const fileRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="typography-small mb-2 font-medium">Add font family</div>
      <div className="mb-2 flex gap-2">
        <Button
          size="xs"
          variant={mode === 'google' ? 'default' : 'outline'}
          onClick={() => setMode('google')}
        >
          Google
        </Button>
        <Button
          size="xs"
          variant={mode === 'file' ? 'default' : 'outline'}
          onClick={() => setMode('file')}
        >
          File
        </Button>
      </div>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">Token id (font-…)</Label>
          <Input
            placeholder="display"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="h-8 font-mono text-xs"
          />
        </div>
        {mode === 'google' ? (
          <>
            <div className="grid gap-1">
              <Label className="text-xs">Google family</Label>
              <Input
                value={googleFamily}
                onChange={(e) => setGoogleFamily(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Weights</Label>
              <Input
                value={weights}
                onChange={(e) => setWeights(e.target.value)}
                className="h-8 font-mono text-xs"
                placeholder="400;700"
              />
            </div>
            <Button
              size="sm"
              onClick={() => {
                const n = id.trim()
                if (!n || existing.includes(n)) return
                onAdd({ id: n, source: 'google', googleFamily, weights })
                setId('')
              }}
            >
              Add Google font
            </Button>
          </>
        ) : (
          <>
            <Input
              ref={fileRef}
              type="file"
              accept=".woff2,.woff,.ttf,.otf"
              className="text-xs"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const n = id.trim() || file.name.replace(/\.[^.]+$/, '')
                if (existing.includes(n)) return
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(String(reader.result))
                  reader.onerror = reject
                  reader.readAsDataURL(file)
                })
                onAdd({ id: n, source: 'file', fileName: file.name, dataUrl })
                setId('')
                e.target.value = ''
              }}
            />
            <p className="text-muted-foreground text-xs">
              Pick a font file; token id defaults to the file name if empty.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function IconsPanel({
  iconMap,
  setIcon,
}: {
  iconMap: Record<string, string>
  setIcon: (key: string, lucideName: string) => void
}) {
  const keys = Object.keys(defaultIconMap)
  const [filter, setFilter] = React.useState('')

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b p-4">
        <h2 className="typography-h5">Icons (Lucide)</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Semantic keys used by UI chrome. Changes apply after save to icon-map.ts.
        </p>
        <Input
          className="mt-2 h-8"
          placeholder="Filter icons…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-4">
          {keys
            .filter((k) => {
              const q = filter.trim().toLowerCase()
              if (!q) return true
              return k.includes(q) || (iconMap[k] ?? '').toLowerCase().includes(q)
            })
            .map((key) => {
              const lucideName = iconMap[key] ?? defaultIconMap[key as keyof typeof defaultIconMap]
              const Preview = resolveLucideIcon(lucideName)
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="bg-muted flex size-9 items-center justify-center rounded-md border">
                    {Preview ? <Preview className="size-4" /> : '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs">{key}</div>
                    <NativeSelect
                      className="mt-1 w-full font-mono text-xs"
                      value={lucideName}
                      onChange={(e) => setIcon(key, e.target.value)}
                    >
                      {lucideIconNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
