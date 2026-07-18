'use client'

import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Rating } from '@/components/ui/rating'

export default function RatingDemo() {
  const [value, setValue] = React.useState(7)
  const [score, setScore] = React.useState(3)

  return (
    <ComponentSection
      id="rating"
      title="Rating"
      description="Segmented numeric scale with hover preview and keyboard navigation."
    >
      <ExampleGrid>
        <Example title="1–10 scale" contentClassName="block w-full max-w-md space-y-2">
          <Rating value={value} onValueChange={setValue} aria-label="NPS score" />
          <p className="text-muted-foreground text-sm">Selected: {value}</p>
        </Example>
        <Example title="1–5 scale" contentClassName="block w-full max-w-xs space-y-2">
          <Rating value={score} onValueChange={setScore} max={5} aria-label="Star rating" />
          <p className="text-muted-foreground text-sm">Selected: {score}</p>
        </Example>
        <Example title="Read-only" contentClassName="block w-full max-w-xs">
          <Rating value={8} max={10} readOnly aria-label="Read-only rating" />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
