"use client";

import * as React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useThemeEditor } from "@/app/theme-editor/_lib/theme-editor-context";
import {
  buildRootValueMap,
  extractVarRef,
  formatNumber,
  isPlainNumber,
  listColorTokenNames,
  listFontTokenNames,
  listRadiusTokenNames,
  listSemanticColorTokenNames,
  listTypographyTokenNames,
  parseUnitValue,
  pxToRem,
  remToPx,
  resolveTokenHex,
  toVarRef,
} from "@/lib/theme/field-types";
import {
  BORDER_STYLE_OPTIONS,
  COLOR_KEYWORD_OPTIONS,
  FONT_STYLE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  OPACITY_OPTIONS,
  OVERFLOW_OPTIONS,
  SCROLLBAR_WIDTH_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  TRANSITION_EASING_OPTIONS,
  TRANSITION_PROPERTY_OPTIONS,
  formatDurationSeconds,
  listShadowTokenNames,
  listTokenRefNames,
  parseDurationSeconds,
  parseTransition,
  serializeTransition,
} from "@/lib/theme/value-parsers";
import { describeVariable } from "@/lib/theme/descriptions";
import { humanizeVarName } from "@/lib/theme/humanize";
import {
  validateHex,
  validateNumber,
  validateRaw,
} from "@/lib/theme/validation";
import type { ThemeFieldType, ThemeVariable } from "@/lib/theme/types";

/**
 * Every select field in the theme editor is a searchable combobox, not a plain <select> —
 * this is the one shared primitive they all render through. Generic over the item shape so
 * plain string options (EnumSelect) and {name,label} token options (TokenSelect) share the
 * same combobox wiring instead of each reimplementing it.
 */
export function SearchSelect<T>({
  items,
  value,
  onValueChange,
  itemToValue,
  itemToLabel,
  placeholder,
  className,
  limit = 200,
}: {
  items: T[];
  value: T | null;
  onValueChange: (item: T | null) => void;
  itemToValue: (item: T) => string;
  itemToLabel: (item: T) => string;
  placeholder?: string;
  className?: string;
  limit?: number;
}) {
  return (
    <Combobox
      items={items}
      value={value}
      onValueChange={(v) => onValueChange((v as T | null) ?? null)}
      itemToStringValue={itemToValue}
      itemToStringLabel={itemToLabel}
      isItemEqualToValue={(a, b) => itemToValue(a as T) === itemToValue(b as T)}
      limit={limit}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className ?? "w-full font-mono text-xs"}
      />
      <ComboboxContent>
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxList>
          {(item: T) => (
            <ComboboxItem key={itemToValue(item)} value={item}>
              {itemToLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function EnumSelect({
  value,
  options,
  onChange,
  placeholder = "Select…",
}: {
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <SearchSelect
      items={options as string[]}
      value={value || null}
      onValueChange={(v) => v && onChange(v)}
      itemToValue={(v) => v}
      itemToLabel={(v) => v}
      placeholder={placeholder}
    />
  );
}

function TokenSelect({
  value,
  options,
  onChange,
  allowEmpty = false,
}: {
  value: string;
  options: Array<{ name: string; label: string }>;
  onChange: (v: string) => void;
  allowEmpty?: boolean;
}) {
  // Checked against this select's own options (not just "is there a ref at all") so that
  // two TokenSelects covering disjoint option sets for the same value (e.g. a color-ref
  // field's "Color Scale" and "Colors" selects) each independently show blank when the
  // current value belongs to the other one, instead of both claiming a mismatched value.
  const ref = extractVarRef(value);
  const current =
    value === "transparent" && options.some((o) => o.name === "transparent")
      ? "transparent"
      : ref && options.some((o) => o.name === ref)
      ? ref
      : "";
  const selected = options.find((o) => o.name === current) ?? null;
  return (
    <SearchSelect
      items={options}
      value={selected}
      onValueChange={(opt) => {
        if (!opt) return;
        if (opt.name === "transparent") onChange("transparent");
        else onChange(toVarRef(opt.name));
      }}
      itemToValue={(o) => o.name}
      itemToLabel={(o) => o.label}
      placeholder={allowEmpty ? "Select token…" : undefined}
    />
  );
}

function HexField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [prevValue, setPrevValue] = React.useState(value);
  const [bare, setBare] = React.useState(() => value.replace(/^#/, ""));
  const [touched, setTouched] = React.useState(false);

  if (prevValue !== value) {
    setPrevValue(value);
    setBare(value.replace(/^#/, ""));
  }

  const error = touched ? validateHex(bare) : null;

  const swatch = /^[0-9a-fA-F]{6}$/.test(bare)
    ? `#${bare}`
    : /^[0-9a-fA-F]{3}$/.test(bare)
    ? `#${bare[0]}${bare[0]}${bare[1]}${bare[1]}${bare[2]}${bare[2]}`
    : "#000000";

  return (
    <div className="grid gap-1">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText className="font-mono">#</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={bare}
          spellCheck={false}
          className="font-mono text-xs"
          aria-invalid={!!error || undefined}
          onChange={(e) => {
            const next = e.target.value.replace(/^#/, "");
            setBare(next);
            if (validateHex(next) === null) onChange(`#${next}`);
          }}
          onBlur={() => setTouched(true)}
        />
        <InputGroupAddon align="inline-end">
          <input
            type="color"
            value={swatch}
            onChange={(e) => {
              const next = e.target.value.replace(/^#/, "");
              setBare(next);
              onChange(`#${next}`);
            }}
            className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Pick color"
          />
        </InputGroupAddon>
      </InputGroup>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function NumberField({
  value,
  unit,
  onChange,
}: {
  value: string;
  unit: string | null;
  onChange: (v: string) => void;
}) {
  const isRem = unit === "rem";

  function toText(v: string) {
    if (!unit) return v;
    const parsed = parseUnitValue(v);
    if (!parsed) return v;
    return isRem ? formatNumber(remToPx(parsed.num)) : formatNumber(parsed.num);
  }

  const [prevValue, setPrevValue] = React.useState(value);
  const [text, setText] = React.useState(() => toText(value));
  const [touched, setTouched] = React.useState(false);

  if (prevValue !== value) {
    setPrevValue(value);
    setText(toText(value));
  }

  const error = touched
    ? validateNumber(text, isRem ? "px" : unit ?? undefined)
    : null;
  const remPreview =
    isRem && isPlainNumber(text) ? formatNumber(pxToRem(Number(text))) : null;

  function handleChange(next: string) {
    setText(next);
    if (!isPlainNumber(next)) return;
    if (isRem) onChange(`${pxToRem(Number(next))}rem`);
    else if (unit) onChange(`${next}${unit}`);
    else onChange(next);
  }

  return (
    <div className="grid gap-1">
      {unit ? (
        <InputGroup>
          <InputGroupInput
            type="number"
            value={text}
            inputMode="decimal"
            step="any"
            spellCheck={false}
            className="font-mono text-xs"
            aria-invalid={!!error || undefined}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="font-mono">
              {isRem ? "px" : unit}
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <InputGroupInput
          type="number"
          value={text}
          inputMode="decimal"
          step="any"
          spellCheck={false}
          className="border-input rounded-lg border font-mono text-xs"
          aria-invalid={!!error || undefined}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
        />
      )}
      {isRem && !error && (
        <p className="text-muted-foreground font-mono text-xs">
          = {remPreview ?? "—"}rem
        </p>
      )}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function DurationField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const seconds = parseDurationSeconds(value) ?? 0.15;
  const [prevValue, setPrevValue] = React.useState(value);
  const [text, setText] = React.useState(formatNumber(seconds));

  if (prevValue !== value) {
    setPrevValue(value);
    const s = parseDurationSeconds(value);
    if (s !== null) setText(formatNumber(s));
  }

  return (
    <InputGroup>
      <InputGroupInput
        type="number"
        value={text}
        inputMode="decimal"
        step="0.01"
        min="0"
        spellCheck={false}
        className="font-mono text-xs"
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value);
          if (!Number.isFinite(n) || n < 0) return;
          onChange(formatDurationSeconds(n));
        }}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupText className="font-mono">s</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

function ColorKeywordField({
  value,
  colorOptions,
  onChange,
}: {
  value: string;
  colorOptions: Array<{ name: string; label: string }>;
  onChange: (v: string) => void;
}) {
  const ref = extractVarRef(value);
  const current = COLOR_KEYWORD_OPTIONS.includes(
    value as (typeof COLOR_KEYWORD_OPTIONS)[number]
  )
    ? value
    : value === "transparent"
    ? "transparent"
    : ref ?? value;

  const options = [
    ...COLOR_KEYWORD_OPTIONS.map((k) => ({ value: k, label: k })),
    ...colorOptions
      .filter((o) => o.name !== "transparent")
      .map((o) => ({ value: o.name, label: o.label })),
  ];
  const selected = options.find((o) => o.value === current) ?? null;

  return (
    <SearchSelect
      items={options}
      value={selected}
      onValueChange={(opt) => {
        if (!opt) return;
        const next = opt.value;
        if (
          COLOR_KEYWORD_OPTIONS.includes(
            next as (typeof COLOR_KEYWORD_OPTIONS)[number]
          ) ||
          next === "transparent"
        ) {
          onChange(next);
        } else if (next.startsWith("--")) {
          onChange(toVarRef(next));
        }
      }}
      itemToValue={(o) => o.value}
      itemToLabel={(o) => o.label}
      placeholder="Select color…"
    />
  );
}

function TransitionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseTransition(value);
  if (!parsed) {
    return <RawField value={value} onChange={onChange} />;
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <span className="text-muted-foreground text-xs">Property</span>
        <EnumSelect
          value={parsed.property}
          options={TRANSITION_PROPERTY_OPTIONS}
          onChange={(property) =>
            onChange(
              serializeTransition({
                property,
                duration: parsed.duration,
                easing: parsed.easing,
              })
            )
          }
        />
      </div>
      <div className="grid gap-1">
        <span className="text-muted-foreground text-xs">Duration</span>
        <DurationField
          value={parsed.duration}
          onChange={(duration) =>
            onChange(
              serializeTransition({
                property: parsed.property,
                duration,
                easing: parsed.easing,
              })
            )
          }
        />
      </div>
      <div className="grid gap-1">
        <span className="text-muted-foreground text-xs">Easing</span>
        <EnumSelect
          value={parsed.easing}
          options={TRANSITION_EASING_OPTIONS}
          onChange={(easing) =>
            onChange(
              serializeTransition({
                property: parsed.property,
                duration: parsed.duration,
                easing,
              })
            )
          }
        />
      </div>
    </div>
  );
}

function RawField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [prevValue, setPrevValue] = React.useState(value);
  const [text, setText] = React.useState(value);
  const [touched, setTouched] = React.useState(false);

  if (prevValue !== value) {
    setPrevValue(value);
    setText(value);
  }

  const error = touched ? validateRaw(text) : null;

  return (
    <div className="grid gap-1">
      <InputGroupInput
        type="text"
        value={text}
        spellCheck={false}
        className="border-input rounded-lg border font-mono text-xs"
        aria-invalid={!!error || undefined}
        onChange={(e) => {
          setText(e.target.value);
          if (validateRaw(e.target.value) === null) onChange(e.target.value);
        }}
        onBlur={() => setTouched(true)}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function SmartField({ variable }: { variable: ThemeVariable }) {
  const {
    values,
    setValue,
    manifest,
    customColors,
    customFonts,
    customTypography,
  } = useThemeEditor();
  const value = values[variable.id] ?? variable.value;
  const type: ThemeFieldType = variable.fieldType;
  const onChange = (v: string) => setValue(variable.id, v);

  const group = React.useMemo(
    () => manifest.groups.find((g) => g.id === variable.id.split(":")[0]),
    [manifest, variable.id]
  );
  const description = React.useMemo(
    () => (group ? describeVariable(variable, group) : null),
    [group, variable]
  );

  const rootValueMap = React.useMemo(
    () => buildRootValueMap(manifest, values),
    [manifest, values]
  );

  const colorOptions = React.useMemo(() => {
    const extra = customColors
      .filter((c) => (c.scope ?? "colors") === "color-scales")
      .map((c) => (c.name.startsWith("--") ? c.name : `--${c.name}`));
    return listColorTokenNames(manifest, extra).map((name) => {
      if (name === "transparent") return { name, label: "transparent" };
      const hex = resolveTokenHex(name, rootValueMap);
      return { name, label: hex ? `${hex} (${name})` : name };
    });
  }, [manifest, customColors, rootValueMap]);

  const semanticColorOptions = React.useMemo(() => {
    const extra = customColors
      .filter((c) => (c.scope ?? "colors") === "colors")
      .map((c) => (c.name.startsWith("--") ? c.name : `--${c.name}`));
    return listSemanticColorTokenNames(manifest, extra).map((name) => {
      const hex = resolveTokenHex(name, rootValueMap);
      return { name, label: hex ? `${hex} (${name})` : name };
    });
  }, [manifest, customColors, rootValueMap]);

  const radiusOptions = React.useMemo(
    () => listRadiusTokenNames(manifest).map((name) => ({ name, label: name })),
    [manifest]
  );

  const shadowOptions = React.useMemo(
    () => listShadowTokenNames().map((name) => ({ name, label: name })),
    []
  );

  const fontOptions = React.useMemo(() => {
    const extra = customFonts.map((f) => `--font-${f.id}`);
    return listFontTokenNames(manifest, extra).map((name) => ({
      name,
      label: name,
    }));
  }, [manifest, customFonts]);

  const typographyOptions = React.useMemo(() => {
    const extra = customTypography.flatMap((t) => {
      const id = t.id.replace(/^typography-/, "");
      return [
        `--typography-${id}-font-family`,
        `--typography-${id}-font-size`,
        `--typography-${id}-font-weight`,
        `--typography-${id}-line-height`,
        `--typography-${id}-letter-spacing`,
      ];
    });
    return listTypographyTokenNames(manifest, extra).map((name) => ({
      name,
      label: name,
    }));
  }, [manifest, customTypography]);

  const tokenRefOptions = React.useMemo(
    () => listTokenRefNames(manifest).map((name) => ({ name, label: name })),
    [manifest]
  );

  const unit = type === "raw" ? parseUnitValue(value)?.unit ?? null : null;
  const isPlainRawNumber = type === "raw" && !unit && isPlainNumber(value);

  return (
    <Field>
      <FieldLabel className="flex flex-wrap items-baseline gap-1.5">
        <span>{humanizeVarName(variable.name)}</span>
        <code className="text-muted-foreground font-mono text-[11px] font-normal">
          ({variable.name})
        </code>
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      {type === "hex" && <HexField value={value} onChange={onChange} />}
      {type === "color-ref" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <span className="text-muted-foreground text-xs">Color scale</span>
            <TokenSelect
              value={value}
              options={colorOptions}
              onChange={onChange}
              allowEmpty
            />
          </div>
          <div className="grid gap-1">
            <span className="text-muted-foreground text-xs">Color</span>
            <TokenSelect
              value={value}
              options={semanticColorOptions}
              onChange={onChange}
              allowEmpty
            />
          </div>
        </div>
      )}
      {type === "color-keyword" && (
        <ColorKeywordField
          value={value}
          colorOptions={colorOptions}
          onChange={onChange}
        />
      )}
      {type === "radius-ref" && (
        <TokenSelect
          value={value}
          options={radiusOptions}
          onChange={onChange}
        />
      )}
      {type === "shadow-ref" && (
        <TokenSelect
          value={value}
          options={shadowOptions}
          onChange={onChange}
        />
      )}
      {type === "token-ref" && (
        <TokenSelect
          value={value}
          options={tokenRefOptions}
          onChange={onChange}
        />
      )}
      {type === "font-ref" && (
        <TokenSelect value={value} options={fontOptions} onChange={onChange} />
      )}
      {type === "typography-ref" && (
        <TokenSelect
          value={value}
          options={typographyOptions}
          onChange={onChange}
        />
      )}
      {type === "opacity" && (
        <EnumSelect
          value={value}
          options={OPACITY_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "overflow" && (
        <EnumSelect
          value={value}
          options={OVERFLOW_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "border-style" && (
        <EnumSelect
          value={value}
          options={BORDER_STYLE_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "font-weight" && (
        <EnumSelect
          value={value}
          options={FONT_WEIGHT_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "text-transform" && (
        <EnumSelect
          value={value}
          options={TEXT_TRANSFORM_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "font-style" && (
        <EnumSelect
          value={value}
          options={FONT_STYLE_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "scrollbar-width" && (
        <EnumSelect
          value={value}
          options={SCROLLBAR_WIDTH_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "easing" && (
        <EnumSelect
          value={value}
          options={TRANSITION_EASING_OPTIONS}
          onChange={onChange}
        />
      )}
      {type === "transition" && (
        <TransitionField value={value} onChange={onChange} />
      )}
      {type === "raw" && (unit || isPlainRawNumber) && (
        <NumberField value={value} unit={unit} onChange={onChange} />
      )}
      {type === "raw" && !unit && !isPlainRawNumber && (
        <RawField value={value} onChange={onChange} />
      )}
    </Field>
  );
}
