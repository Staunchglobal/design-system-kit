'use client'

import { CopyIcon, MailIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'

export default function InputGroupDemo() {
  return (
    <ComponentSection
        id="input-group"
        title="Input Group"
        description="Composable input wrapper for addons such as icons, buttons, and text."
      >
        <Example title="Leading icon addon">
          <InputGroup className="w-64">
            <InputGroupAddon>
              <MailIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="you@example.com" />
          </InputGroup>
        </Example>

        <Example title="Trailing button addon">
          <InputGroup className="w-64">
            <InputGroupInput readOnly defaultValue="https://example.com/share/abc123" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Copy link" size="icon-xs">
                <CopyIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Example>

        <Example title="Textarea with footer addon">
          <InputGroup className="w-64">
            <InputGroupTextarea placeholder="Write a comment..." rows={3} />
            <InputGroupAddon align="block-end">
              <InputGroupText>0/200</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Example>
      </ComponentSection>
  )
}
