'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { BrandColorPicker, type BrandColorOption } from '@/components/ui/brand-color-picker'

const OPTIONS: BrandColorOption[] = [
  { id: 'blue', label: 'Blue', swatch: '#2563eb' },
  { id: 'emerald', label: 'Emerald', swatch: '#059669' },
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'amber', label: 'Amber', swatch: '#d97706' },
  { id: 'slate', label: 'Slate', swatch: '#475569' },
]

export default function BrandColorPickerDemo() {
  const [value, setValue] = React.useState('blue')
  const selected = OPTIONS.find((o) => o.id === value)

  return (
    <ComponentSection
      id="brand-color-picker"
      title="Brand Color Picker"
      description="Presentational swatch picker for end-user brand colors. Persistence and CSS-variable writing stay in the consumer app."
    >
      <Example title="Preset swatches" contentClassName="block space-y-3">
        <BrandColorPicker options={OPTIONS} value={value} onValueChange={setValue} />
        <p className="text-muted-foreground text-sm">
          Selected: {selected?.label} ({selected?.swatch})
        </p>
        {/* Recommended consumer pattern:
            document.documentElement.style.setProperty('--primary', selected.swatch)
            + persist to your backend / localStorage */}
      </Example>
    </ComponentSection>
  )
}
