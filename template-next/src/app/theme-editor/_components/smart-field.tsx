'use client'

import * as React from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { NativeSelect } from '@/components/ui/native-select'
import { useThemeEditor } from '@/app/theme-editor/_lib/theme-editor-context'
import {
  buildRootValueMap,
  extractVarRef,
  formatNumber,
  isPlainNumber,
  listColorTokenNames,
  listFontTokenNames,
  listRadiusTokenNames,
  listTypographyTokenNames,
  parseUnitValue,
  pxToRem,
  remToPx,
  resolveTokenHex,
  toVarRef,
} from '@/lib/theme/field-types'
import { describeVariable } from '@/lib/theme/descriptions'
import { humanizeVarName } from '@/lib/theme/humanize'
import { validateHex, validateNumber, validateRaw } from '@/lib/theme/validation'
import type { ThemeFieldType, ThemeVariable } from '@/lib/theme/types'

function TokenSelect({
  value,
  options,
  onChange,
}: {
  value: string
  options: Array<{ name: string; label: string }>
  onChange: (v: string) => void
}) {
  const current = extractVarRef(value) ?? ''
  return (
    <NativeSelect
      className="w-full font-mono text-xs"
      value={current}
      onChange={(e) => {
        const next = e.target.value
        if (next) onChange(toVarRef(next))
      }}
    >
      {!current && <option value="">Select token…</option>}
      {options.map((opt) => (
        <option key={opt.name} value={opt.name}>
          {opt.label}
        </option>
      ))}
    </NativeSelect>
  )
}

/** Hex fields store `#rrggbb`; the `#` is a fixed, non-editable prefix — users only type the digits. */
function HexField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [prevValue, setPrevValue] = React.useState(value)
  const [bare, setBare] = React.useState(() => value.replace(/^#/, ''))
  const [touched, setTouched] = React.useState(false)

  if (prevValue !== value) {
    setPrevValue(value)
    setBare(value.replace(/^#/, ''))
  }

  const error = touched ? validateHex(bare) : null

  const swatch = /^[0-9a-fA-F]{6}$/.test(bare)
    ? `#${bare}`
    : /^[0-9a-fA-F]{3}$/.test(bare)
      ? `#${bare[0]}${bare[0]}${bare[1]}${bare[1]}${bare[2]}${bare[2]}`
      : '#000000'

  return (
    <div className="grid gap-1">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText className="font-mono">#</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          value={bare}
          spellCheck={false}
          className="font-mono text-xs"
          aria-invalid={!!error || undefined}
          onChange={(e) => {
            const next = e.target.value.replace(/^#/, '')
            setBare(next)
            if (validateHex(next) === null) onChange(`#${next}`)
          }}
          onBlur={() => setTouched(true)}
        />
        <InputGroupAddon align="inline-end">
          <input
            type="color"
            value={swatch}
            onChange={(e) => {
              const next = e.target.value.replace(/^#/, '')
              setBare(next)
              onChange(`#${next}`)
            }}
            className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Pick color"
          />
        </InputGroupAddon>
      </InputGroup>
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}

/**
 * Plain-number and unit-suffixed values (px, em, %, deg, ms, s, vh, vw…). The unit is a fixed
 * suffix the user never types. `rem` values are shown to the user as px (friendlier), with a
 * live read-out of the underlying rem value that updates as they type; the stored CSS value
 * always stays in rem.
 */
function NumberField({
  value,
  unit,
  onChange,
}: {
  value: string
  unit: string | null
  onChange: (v: string) => void
}) {
  const isRem = unit === 'rem'

  function toText(v: string) {
    if (!unit) return v
    const parsed = parseUnitValue(v)
    if (!parsed) return v
    return isRem ? formatNumber(remToPx(parsed.num)) : formatNumber(parsed.num)
  }

  const [prevValue, setPrevValue] = React.useState(value)
  const [text, setText] = React.useState(() => toText(value))
  const [touched, setTouched] = React.useState(false)

  if (prevValue !== value) {
    setPrevValue(value)
    setText(toText(value))
  }

  const error = touched ? validateNumber(text, isRem ? 'px' : (unit ?? undefined)) : null
  const remPreview = isRem && isPlainNumber(text) ? formatNumber(pxToRem(Number(text))) : null

  function handleChange(next: string) {
    setText(next)
    if (!isPlainNumber(next)) return
    if (isRem) onChange(`${pxToRem(Number(next))}rem`)
    else if (unit) onChange(`${next}${unit}`)
    else onChange(next)
  }

  return (
    <div className="grid gap-1">
      {unit ? (
        <InputGroup>
          <InputGroupInput
            value={text}
            inputMode="decimal"
            spellCheck={false}
            className="font-mono text-xs"
            aria-invalid={!!error || undefined}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="font-mono">{isRem ? 'px' : unit}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <InputGroupInput
          value={text}
          inputMode="decimal"
          spellCheck={false}
          className="border-input rounded-lg border font-mono text-xs"
          aria-invalid={!!error || undefined}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      )}
      {isRem && !error && (
        <p className="text-muted-foreground font-mono text-xs">= {remPreview ?? '—'}rem</p>
      )}
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}

/** Fallback for complex CSS values (color-mix(), calc(), font stacks, box-shadow lists, keywords…). */
function RawField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [prevValue, setPrevValue] = React.useState(value)
  const [text, setText] = React.useState(value)
  const [touched, setTouched] = React.useState(false)

  if (prevValue !== value) {
    setPrevValue(value)
    setText(value)
  }

  const error = touched ? validateRaw(text) : null

  return (
    <div className="grid gap-1">
      <InputGroupInput
        value={text}
        spellCheck={false}
        className="border-input rounded-lg border font-mono text-xs"
        aria-invalid={!!error || undefined}
        onChange={(e) => {
          setText(e.target.value)
          if (validateRaw(e.target.value) === null) onChange(e.target.value)
        }}
        onBlur={() => setTouched(true)}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}

export function SmartField({ variable }: { variable: ThemeVariable }) {
  const { values, setValue, manifest, customColors, customFonts, customTypography } =
    useThemeEditor()
  const value = values[variable.id] ?? variable.value
  const type: ThemeFieldType = variable.fieldType
  const onChange = (v: string) => setValue(variable.id, v)

  const group = React.useMemo(
    () => manifest.groups.find((g) => g.id === variable.id.split(':')[0]),
    [manifest, variable.id]
  )
  const description = React.useMemo(
    () => (group ? describeVariable(variable, group) : null),
    [group, variable]
  )

  const rootValueMap = React.useMemo(() => buildRootValueMap(manifest, values), [manifest, values])

  const colorOptions = React.useMemo(() => {
    const extra = customColors.map((c) => (c.name.startsWith('--') ? c.name : `--${c.name}`))
    return listColorTokenNames(manifest, extra).map((name) => {
      const hex = resolveTokenHex(name, rootValueMap)
      return { name, label: hex ? `${hex} (${name})` : name }
    })
  }, [manifest, customColors, rootValueMap])

  const radiusOptions = React.useMemo(
    () => listRadiusTokenNames(manifest).map((name) => ({ name, label: name })),
    [manifest]
  )

  const fontOptions = React.useMemo(() => {
    const extra = customFonts.map((f) => `--font-${f.id}`)
    return listFontTokenNames(manifest, extra).map((name) => ({ name, label: name }))
  }, [manifest, customFonts])

  const typographyOptions = React.useMemo(() => {
    const extra = customTypography.flatMap((t) => {
      const id = t.id.replace(/^typography-/, '')
      return [
        `--typography-${id}-font-family`,
        `--typography-${id}-font-size`,
        `--typography-${id}-font-weight`,
        `--typography-${id}-line-height`,
        `--typography-${id}-letter-spacing`,
      ]
    })
    return listTypographyTokenNames(manifest, extra).map((name) => ({ name, label: name }))
  }, [manifest, customTypography])

  const unit = type === 'raw' ? (parseUnitValue(value)?.unit ?? null) : null
  const isPlainRawNumber = type === 'raw' && !unit && isPlainNumber(value)

  return (
    <Field>
      <FieldLabel className="flex flex-wrap items-baseline gap-1.5">
        <span>{humanizeVarName(variable.name)}</span>
        <code className="text-muted-foreground font-mono text-[11px] font-normal">
          ({variable.name})
        </code>
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      {type === 'hex' && <HexField value={value} onChange={onChange} />}
      {type === 'color-ref' && (
        <TokenSelect value={value} options={colorOptions} onChange={onChange} />
      )}
      {type === 'radius-ref' && (
        <TokenSelect value={value} options={radiusOptions} onChange={onChange} />
      )}
      {type === 'font-ref' && (
        <TokenSelect value={value} options={fontOptions} onChange={onChange} />
      )}
      {type === 'typography-ref' && (
        <TokenSelect value={value} options={typographyOptions} onChange={onChange} />
      )}
      {type === 'raw' && (unit || isPlainRawNumber) && (
        <NumberField value={value} unit={unit} onChange={onChange} />
      )}
      {type === 'raw' && !unit && !isPlainRawNumber && (
        <RawField value={value} onChange={onChange} />
      )}
    </Field>
  )
}
