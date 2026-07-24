import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { SearchSelect, SmartField } from '@/theme-editor/_components/smart-field'
import { useThemeEditor } from '@/theme-editor/_lib/theme-editor-context'
import {
  groupVariablesForEditor,
  listColorTokenNames,
  listTypographyVariantNames,
  toVarRef,
} from '@/lib/theme/field-types'
import { AppIcon, lucideIconNames } from '@/components/icons/icon'
import { defaultIconMap } from '@/components/icons/icon-map'
import { googleFonts } from '@/lib/theme/google-fonts'
import { humanizeKey } from '@/lib/theme/humanize'
import { isValidRenameTarget, validateHex } from '@/lib/theme/validation'
import tokenFamilies from '@/lib/theme/token-families.json'
import type { RenameTokenFamily, RenameTokenPlan, RenameTokenResponse, ThemeManifest } from '@/lib/theme/types'

const ICON_GROUP_ALIAS: Record<string, string> = {
  context: 'context-menu',
  dropdown: 'dropdown-menu',
  sonner: 'sonner-toast',
}

function iconKeysForGroup(groupId: string): string[] {
  return Object.keys(defaultIconMap).filter((key) => {
    const prefix = key.split('.')[0]
    return (ICON_GROUP_ALIAS[prefix] ?? prefix) === groupId
  })
}

const RENAME_FAMILY_BY_GROUP: Record<string, RenameTokenFamily> = {
  colors: 'color',
  'color-scales': 'color',
  radius: 'radius',
  typography: 'typography',
  shadows: 'shadow',
}

export function VariableForm() {
  const {
    manifest,
    activeGroupId,
    addColor,
    removeColor,
    addTypography,
    removeTypography,
    addFont,
    removeFont,
    setIcon,
    iconMap,
    customColors,
    customTypography,
    customFonts,
    previewRename,
    applyRename,
  } = useThemeEditor()

  const group = manifest.groups.find((g) => g.id === activeGroupId)
  if (!group) {
    return <div className="text-muted-foreground p-4 text-sm">Unknown group</div>
  }

  const variables = groupVariablesForEditor(group.id, group.variables)
  const iconKeys = iconKeysForGroup(group.id)

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b p-4">
        <h2 className="typography-h5">{group.title}</h2>
        <p className="text-muted-foreground typography-caption mt-1 font-mono">{group.file}</p>
        <p className="text-muted-foreground mt-1 text-xs">{variables.length} variables</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {RENAME_FAMILY_BY_GROUP[group.id] && (
            <RenameTokenForm
              key={group.id}
              family={RENAME_FAMILY_BY_GROUP[group.id]}
              manifest={manifest}
              onPreview={previewRename}
              onApply={applyRename}
            />
          )}
          {group.id === 'color-scales' && (
            <>
              <AddColorForm
                onAdd={(c) => addColor({ ...c, scope: 'color-scales' })}
                existing={customColors.map((c) => c.name)}
              />
              <PendingItemsList
                items={customColors.filter((c) => (c.scope ?? 'colors') === 'color-scales')}
                keyOf={(c) => c.name}
                labelOf={(c) => `${c.name} — ${c.hex}`}
                onRemove={removeColor}
              />
            </>
          )}
          {group.id === 'colors' && (
            <>
              <AddColorRefForm
                manifest={manifest}
                customColors={customColors}
                onAdd={(c) => addColor({ ...c, scope: 'colors' })}
                existing={customColors.map((c) => c.name)}
              />
              <PendingItemsList
                items={customColors.filter((c) => (c.scope ?? 'colors') === 'colors')}
                keyOf={(c) => c.name}
                labelOf={(c) => `${c.name} — ${c.hex}`}
                onRemove={removeColor}
              />
            </>
          )}
          {group.id === 'typography' && (
            <>
              <AddTypographyForm onAdd={addTypography} existing={customTypography.map((t) => t.id)} />
              <PendingItemsList
                items={customTypography}
                keyOf={(t) => t.id}
                labelOf={(t) => t.id.replace(/^typography-/, '')}
                onRemove={removeTypography}
              />
            </>
          )}
          {group.id === 'fonts' && (
            <>
              <AddFontForm onAdd={addFont} existing={customFonts.map((f) => f.id)} />
              <PendingItemsList
                items={customFonts}
                keyOf={(f) => f.id}
                labelOf={(f) => `${f.id} (${f.source === 'google' ? f.googleFamily : f.fileName})`}
                onRemove={removeFont}
              />
            </>
          )}
          {iconKeys.map((key) => (
            <IconField key={key} iconKey={key} iconMap={iconMap} setIcon={setIcon} />
          ))}
          {variables.map((v) => (
            <SmartField key={v.id} variable={v} />
          ))}
        </div>
      </div>
    </div>
  )
}

function IconField({
  iconKey,
  iconMap,
  setIcon,
}: {
  iconKey: string
  iconMap: Record<string, string>
  setIcon: (key: string, lucideName: string) => void
}) {
  const lucideName = iconMap[iconKey] ?? defaultIconMap[iconKey as keyof typeof defaultIconMap]
  return (
    <Field>
      <FieldLabel className="flex flex-wrap items-baseline gap-1.5">
        <span>{humanizeKey(iconKey.split('.')[1] ?? iconKey)} icon</span>
        <code className="text-muted-foreground font-mono text-[11px] font-normal">({iconKey})</code>
      </FieldLabel>
      <div className="flex items-center gap-3">
        <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md border">
          <AppIcon name={lucideName} className="size-4" />
        </div>
        <SearchSelect
          items={lucideIconNames}
          value={lucideName || null}
          onValueChange={(n) => n && setIcon(iconKey, n)}
          itemToValue={(n) => n}
          itemToLabel={(n) => n}
        />
      </div>
    </Field>
  )
}

function fromOptionsFor(family: RenameTokenFamily, manifest: ThemeManifest): string[] {
  switch (family) {
    case 'color': {
      const names = new Set<string>([
        ...tokenFamilies.shadeFamilies,
        ...tokenFamilies.colorSemantic.filter((n) => !n.endsWith('-foreground')),
      ])
      return [...names].sort()
    }
    case 'radius':
      return [...tokenFamilies.radiusSteps]
    case 'shadow':
      return [...tokenFamilies.shadowSteps]
    case 'typography':
      return listTypographyVariantNames(manifest)
  }
}

function relDisplay(absPath: string): string {
  const marker = absPath.lastIndexOf('/src/')
  return marker === -1 ? absPath : `src/${absPath.slice(marker + '/src/'.length)}`
}

function reservedWordsFor(family: RenameTokenFamily): string[] {
  switch (family) {
    case 'color':
      return tokenFamilies.reservedWords.color
    case 'radius':
      return tokenFamilies.reservedWords.radius
    case 'shadow':
      return tokenFamilies.reservedWords.shadow
    case 'typography':
      return []
  }
}

function allTokenNames(manifest: ThemeManifest): string[] {
  const names = new Set<string>()
  for (const g of manifest.groups) for (const v of g.variables) names.add(v.name.replace(/^--/, ''))
  return [...names]
}

function RenameTokenForm({
  family,
  manifest,
  onPreview,
  onApply,
}: {
  family: RenameTokenFamily
  manifest: ThemeManifest
  onPreview: (req: { family: RenameTokenFamily; from: string; to: string }) => Promise<RenameTokenResponse>
  onApply: (req: { family: RenameTokenFamily; from: string; to: string }) => Promise<RenameTokenResponse>
}) {
  const fromOptions = React.useMemo(() => fromOptionsFor(family, manifest), [family, manifest])
  const existingNames = React.useMemo(() => allTokenNames(manifest), [manifest])
  const reserved = React.useMemo(() => reservedWordsFor(family), [family])
  const [from, setFrom] = React.useState(fromOptions[0] ?? '')
  const [to, setTo] = React.useState('')
  const [plan, setPlan] = React.useState<RenameTokenPlan | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  const toTrimmed = to.trim()
  const toError = toTrimmed ? isValidRenameTarget(family, from, toTrimmed, existingNames) : null

  return (
    <div className="bg-muted/40 rounded-lg border p-3">
      <div className="typography-small mb-2 font-medium">Rename token</div>
      <p className="text-muted-foreground mb-2 text-xs">
        Renames this identifier everywhere it&apos;s used — CSS variables, the Tailwind
        bridge, and every component that references it.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1">
          <Label className="text-xs">From</Label>
          <SearchSelect
            items={fromOptions}
            value={from || null}
            onValueChange={(v) => {
              if (v) setFrom(v)
              setPlan(null)
              setStatus(null)
            }}
            itemToValue={(v) => v}
            itemToLabel={(v) => v}
            className="h-8 w-36 font-mono text-xs"
          />
        </div>
        <div className="grid gap-1">
          <div className="flex items-center gap-1">
            <Label className="text-xs">To</Label>
            {reserved.length > 0 && (
              <span
                title={`Reserved — can't be used: ${reserved.join(', ')}`}
                className="text-muted-foreground inline-flex"
                aria-label="Reserved names"
              >
                <AppIcon name="Info" className="size-3.5" />
              </span>
            )}
          </div>
          <Input
            placeholder="new-name"
            value={to}
            aria-invalid={!!toError || undefined}
            onChange={(e) => {
              setTo(e.target.value)
              setPlan(null)
              setStatus(null)
            }}
            className="h-8 w-36 font-mono text-xs"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={busy || !from || !toTrimmed || !!toError}
          onClick={async () => {
            setBusy(true)
            setStatus(null)
            const res = await onPreview({ family, from, to: toTrimmed })
            setStatus(res.message)
            setPlan(res.ok ? res.plan : null)
            setBusy(false)
          }}
        >
          Preview
        </Button>
        {plan && (
          <Button
            size="sm"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const res = await onApply({ family, from, to: toTrimmed })
              setStatus(res.message)
              setBusy(false)
              if (res.ok) setPlan(null)
            }}
          >
            Confirm rename
          </Button>
        )}
      </div>
      {toError && <FieldError className="mt-1">{toError}</FieldError>}
      {plan && (
        <div className="bg-background mt-2 max-h-40 overflow-y-auto rounded border p-2 text-xs">
          <div className="mb-1 font-medium">
            {plan.totalMatches} occurrence{plan.totalMatches === 1 ? '' : 's'} across{' '}
            {plan.changes.length} file{plan.changes.length === 1 ? '' : 's'}
          </div>
          {plan.changes.map((c, i) => (
            <div key={`${c.path}-${c.kind}-${i}`} className="text-muted-foreground truncate font-mono">
              {relDisplay(c.path)} <span className="text-foreground">({c.matches})</span>
            </div>
          ))}
        </div>
      )}
      {status && <p className="text-muted-foreground mt-2 text-xs">{status}</p>}
    </div>
  )
}

function PendingItemsList<T>({
  items,
  keyOf,
  labelOf,
  onRemove,
}: {
  items: T[]
  keyOf: (item: T) => string
  labelOf: (item: T) => string
  onRemove: (key: string) => void
}) {
  if (!items.length) return null
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const key = keyOf(item)
        return (
          <div
            key={key}
            className="bg-background flex items-center justify-between gap-2 rounded border px-2 py-1 text-xs"
          >
            <span className="truncate font-mono">{labelOf(item)}</span>
            <button
              type="button"
              onClick={() => onRemove(key)}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label={`Remove ${key}`}
            >
              <AppIcon name="X" className="size-3.5" />
            </button>
          </div>
        )
      })}
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
          <SearchSelect
            items={scaleTokens}
            value={scaleToken || null}
            onValueChange={(t) => t && setScaleToken(t)}
            itemToValue={(t) => t}
            itemToLabel={(t) => t}
            className="h-8 w-44 font-mono text-xs"
          />
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
  const availableWeights = React.useMemo(
    () => googleFonts.find((f) => f.family === googleFamily)?.weights ?? [400],
    [googleFamily]
  )
  const [selectedWeights, setSelectedWeights] = React.useState<number[]>([400])
  const [prevGoogleFamily, setPrevGoogleFamily] = React.useState(googleFamily)
  if (googleFamily !== prevGoogleFamily) {
    setPrevGoogleFamily(googleFamily)
    setSelectedWeights(availableWeights.includes(400) ? [400] : availableWeights.slice(0, 1))
  }
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
              <SearchSelect
                items={googleFonts}
                value={googleFonts.find((f) => f.family === googleFamily) ?? null}
                onValueChange={(f) => f && setGoogleFamily(f.family)}
                itemToValue={(f) => f.family}
                itemToLabel={(f) => f.family}
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Weights</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableWeights.map((w) => (
                  <label
                    key={w}
                    className="border-input has-[:checked]:bg-accent has-[:checked]:border-ring flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-xs"
                  >
                    <input
                      type="checkbox"
                      className="size-3.5"
                      checked={selectedWeights.includes(w)}
                      onChange={(e) => {
                        setSelectedWeights((prev) =>
                          e.target.checked
                            ? [...prev, w].sort((a, b) => a - b)
                            : prev.filter((x) => x !== w)
                        )
                      }}
                    />
                    {w}
                  </label>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              disabled={!selectedWeights.length}
              onClick={() => {
                const n = id.trim()
                if (!n || existing.includes(n) || !selectedWeights.length) return
                onAdd({ id: n, source: 'google', googleFamily, weights: selectedWeights.join(';') })
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

