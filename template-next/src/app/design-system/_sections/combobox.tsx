'use client'

import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'

const FRUITS = ['Apple', 'Banana', 'Orange', 'Mango', 'Grape', 'Kiwi']
const MANY = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`)

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

function MultiSelectOverflow() {
  const anchor = useComboboxAnchor()
  const [value, setValue] = React.useState<string[]>(['Apple', 'Banana', 'Orange', 'Mango'])

  return (
    <div className="flex w-80 flex-col gap-1.5">
      <Label>Multi-select with chip overflow</Label>
      <Combobox
        multiple
        items={FRUITS}
        value={value}
        onValueChange={(next) => setValue(next as string[])}
      >
        <ComboboxChips ref={anchor} maxVisibleChips={2}>
          {value.map((item) => (
            <ComboboxChip key={item}>{item}</ComboboxChip>
          ))}
          <ComboboxChipsInput placeholder="Add fruit…" />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
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
    </div>
  )
}

function InfiniteScrollCombobox() {
  const [limit, setLimit] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const items = MANY.slice(0, limit)
  const inputId = React.useId()
  const [value, setValue] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>Infinite scroll list</Label>
      <Combobox items={items} value={value} onValueChange={setValue}>
        <ComboboxInput id={inputId} placeholder="Search…" className="w-64" />
        <ComboboxContent>
          <ComboboxEmpty>No items.</ComboboxEmpty>
          <ComboboxList
            isLoadingMore={loading}
            onLoadMore={() => {
              if (loading || limit >= MANY.length) return
              setLoading(true)
              setTimeout(() => {
                setLimit((n) => Math.min(n + 10, MANY.length))
                setLoading(false)
              }, 400)
            }}
          >
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
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
      <ExampleGrid>
        <Example title="Searchable combobox">
          <FruitCombobox />
        </Example>
        <Example title="Chip overflow">
          <MultiSelectOverflow />
        </Example>
        <Example title="Infinite scroll">
          <InfiniteScrollCombobox />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}

