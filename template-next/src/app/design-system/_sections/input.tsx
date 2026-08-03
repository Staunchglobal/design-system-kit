'use client'

import { SearchIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

export default function InputDemo() {
  return (
    <ComponentSection
        id="input"
        title="Input"
        description="Single-line text field for user input."
      >
        <Example title="Default">
          <Input placeholder="Email address" />
        </Example>

        <Example title="Disabled">
          <Input disabled placeholder="Disabled input" />
        </Example>

        <Example title="Invalid" description="Styled via aria-invalid.">
          <Input aria-invalid defaultValue="not-an-email" />
        </Example>

        <Example title="File input">
          <Input type="file" />
        </Example>

        <Example title="With leading icon">
          <InputGroup className="w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search..." />
          </InputGroup>
        </Example>
      </ComponentSection>
  )
}
