'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaDemo() {
  return (
    <ComponentSection
        id="textarea"
        title="Textarea"
        description="Multi-line text field for longer user input."
      >
        <Example title="Default">
          <Textarea placeholder="Type your message here." />
        </Example>

        <Example title="Disabled">
          <Textarea disabled placeholder="Disabled textarea" />
        </Example>

        <Example title="Invalid" description="Styled via aria-invalid.">
          <Textarea aria-invalid defaultValue="This message is invalid." />
        </Example>

        <Example title="Fixed rows">
          <Textarea rows={6} placeholder="Six rows tall" />
        </Example>
      </ComponentSection>
  )
}
