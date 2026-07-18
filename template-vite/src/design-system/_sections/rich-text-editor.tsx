'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

export default function RichTextEditorDemo() {
  const [value, setValue] = React.useState(
    '<p>Write a <strong>session note</strong>, <u>underline</u> what matters, or <a href="https://example.com">link</a> to a reference.</p>'
  )

  return (
    <ComponentSection
      id="rich-text-editor"
      title="Rich Text Editor"
      description="Tiptap editor with kit toolbar primitives (bold, italic, strike, underline, link, headings, lists)."
    >
      <Example title="Controlled HTML" contentClassName="block w-full max-w-2xl space-y-3">
        <RichTextEditor
          value={value}
          onChange={setValue}
          placeholder="Start typing…"
          aria-label="Session notes"
        />
        <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">{value}</pre>
      </Example>
    </ComponentSection>
  )
}
