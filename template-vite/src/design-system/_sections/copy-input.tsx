import * as React from 'react'

import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { CopyInput } from '@/components/ui/copy-input'

export default function CopyInputDemo() {
  const [webhookUrl, setWebhookUrl] = React.useState('https://hooks.example.com/t/abc123')

  return (
    <ComponentSection
      id="copy-input"
      title="Copy Input"
      description="Input with a clipboard copy affordance via the native Clipboard API."
    >
      <Example title="Read-only" contentClassName="block w-80">
        <CopyInput value="https://example.com/invite/abc123" />
      </Example>
      <Example title="Editable" contentClassName="block w-80">
        <CopyInput value={webhookUrl} editable onValueChange={setWebhookUrl} />
      </Example>
    </ComponentSection>
  )
}
