'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { TagInput } from '@/components/ui/tag-input'

export default function TagInputDemo() {
  const [tags, setTags] = React.useState(['design', 'system'])
  const [emails, setEmails] = React.useState<string[]>([])

  return (
    <ComponentSection
      id="tag-input"
      title="Tag Input"
      description="Free-text chip input. Enter or comma commits; Backspace removes the last tag."
    >
      <Example title="Default" contentClassName="block w-full max-w-md">
        <TagInput value={tags} onValueChange={setTags} placeholder="Add a tag…" />
      </Example>
      <Example title="Email validation" contentClassName="block w-full max-w-md">
        <TagInput
          value={emails}
          onValueChange={setEmails}
          placeholder="name@example.com"
          validate={(tag) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? true : 'Enter a valid email')}
        />
      </Example>
    </ComponentSection>
  )
}
