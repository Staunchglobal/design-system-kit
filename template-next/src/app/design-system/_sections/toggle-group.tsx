'use client'

import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupDemo() {
  return (
    <ComponentSection
        id="toggle-group"
        title="Toggle Group"
        description="A set of toggle buttons where selection can be single or multiple."
      >
        <Example title="Single select">
          <ToggleGroup type="single" defaultValue="bold" variant="outline">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Example>

        <Example title="Multiple select">
          <ToggleGroup type="multiple" defaultValue={['bold', 'italic']}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Example>

        <Example title="With disabled item">
          <ToggleGroup type="single" variant="outline">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <BoldIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic" disabled>
              <ItalicIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline">
              <UnderlineIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </Example>
      </ComponentSection>
  )
}
