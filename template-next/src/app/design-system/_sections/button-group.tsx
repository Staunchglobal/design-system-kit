'use client'

import { BoldIcon, ItalicIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'

export default function ButtonGroupDemo() {
  return (
    <ComponentSection
        id="button-group"
        title="Button Group"
        description="Groups related buttons together with connected borders."
      >
        <Example title="Horizontal">
          <ButtonGroup>
            <Button variant="outline">Left</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Right</Button>
          </ButtonGroup>
        </Example>

        <Example title="Vertical">
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
        </Example>

        <Example title="With separator and text">
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="Bold">
              <BoldIcon />
            </Button>
            <Button variant="outline" size="icon" aria-label="Italic">
              <ItalicIcon />
            </Button>
            <ButtonGroupSeparator />
            <ButtonGroupText>12px</ButtonGroupText>
          </ButtonGroup>
        </Example>

        <Example title="Mixed with input">
          <ButtonGroup>
            <Input placeholder="Search..." />
            <Button variant="outline">Search</Button>
          </ButtonGroup>
        </Example>
      </ComponentSection>
  )
}
