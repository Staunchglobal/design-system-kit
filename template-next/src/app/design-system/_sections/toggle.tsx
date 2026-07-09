'use client'

import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Toggle } from '@/components/ui/toggle'

export default function ToggleDemo() {
  return (
    <ComponentSection
        id="toggle"
        title="Toggle"
        description="A two-state button that can be either on or off."
      >
        <ExampleGrid>
          <Example title="Default variant, all sizes">
            <Toggle size="sm" aria-label="Toggle bold">
              <BoldIcon />
            </Toggle>
            <Toggle size="default" aria-label="Toggle bold">
              <BoldIcon />
            </Toggle>
            <Toggle size="lg" aria-label="Toggle bold">
              <BoldIcon />
            </Toggle>
          </Example>

          <Example title="Outline variant, all sizes">
            <Toggle variant="outline" size="sm" aria-label="Toggle italic">
              <ItalicIcon />
            </Toggle>
            <Toggle variant="outline" size="default" aria-label="Toggle italic">
              <ItalicIcon />
            </Toggle>
            <Toggle variant="outline" size="lg" aria-label="Toggle italic">
              <ItalicIcon />
            </Toggle>
          </Example>

          <Example title="Pressed">
            <Toggle defaultPressed aria-label="Toggle bold">
              <BoldIcon />
              Bold
            </Toggle>
          </Example>

          <Example title="Disabled">
            <Toggle disabled aria-label="Toggle underline">
              <UnderlineIcon />
              Underline
            </Toggle>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
