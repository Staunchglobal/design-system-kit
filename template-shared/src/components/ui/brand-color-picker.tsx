'use client'

import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

type BrandColorOption = {
  id: string
  label: string
  /** CSS color value (hex recommended for contrast auto-calculation). */
  swatch: string
  /** Override the check-icon foreground. Auto-computed from `color` when omitted. */
  foreground?: string
}

type BrandColorPickerProps = {
  options: BrandColorOption[]
  value: string
  onValueChange: (value: string) => void
  /** Accessible label for the radiogroup. Defaults to "Brand color". */
  label?: string
  className?: string
}

/**
 * Determines whether black or white text provides sufficient contrast against
 * the given hex background color using the WCAG relative-luminance formula.
 * Returns '#ffffff' or '#000000'.
 */
function getContrastForeground(hex: string): string {
  const clean = hex.replace('#', '')
  const src = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  if (src.length !== 6) return '#000000'

  const r = parseInt(src.slice(0, 2), 16)
  const g = parseInt(src.slice(2, 4), 16)
  const b = parseInt(src.slice(4, 6), 16)

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#000000'

  const linearize = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }

  const L = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  return L > 0.179 ? '#000000' : '#ffffff'
}

function BrandColorPicker({
  options,
  value,
  onValueChange,
  label = 'Brand color',
  className,
}: BrandColorPickerProps) {
  return (
    <div
      data-slot="brand-color-picker"
      role="radiogroup"
      aria-label={label}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const isSelected = option.id === value
        const fg = option.foreground ?? getContrastForeground(option.swatch)

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            data-slot="brand-color-swatch"
            data-selected={isSelected || undefined}
            onClick={() => onValueChange(option.id)}
            className={cn(
              'relative flex size-8 items-center justify-center rounded-full transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isSelected && 'ring-2 ring-ring ring-offset-2'
            )}
            style={{ backgroundColor: option.swatch }}
            title={option.label}
          >
            {isSelected ? (
              <Check className="size-4" style={{ color: fg }} aria-hidden="true" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export { BrandColorPicker, getContrastForeground }
export type { BrandColorPickerProps, BrandColorOption }
