import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'

const FRUITS = ['Apple', 'Banana', 'Orange', 'Mango', 'Grape', 'Kiwi']

function FruitCombobox() {
  const inputId = React.useId()
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>Favorite fruit</Label>
      <Combobox items={FRUITS} value={value} onValueChange={setValue}>
        <ComboboxInput id={inputId} placeholder="Search fruit..." className="w-64" />
        <ComboboxContent>
          <ComboboxEmpty>No fruit found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-muted-foreground text-xs">Selected: {value ?? 'none'}</p>
    </div>
  )
}

export default function ComboboxDemo() {
  return (
    <ComponentSection
        id="combobox"
        title="Combobox"
        description="A searchable input paired with a filterable popup list, built on Base UI."
      >
        <Example title="Searchable combobox">
          <FruitCombobox />
        </Example>
      </ComponentSection>
  )
}
