'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Spinner } from '@/components/ui/spinner'

export default function SpinnerDemo() {
  return (
    <ComponentSection id="spinner" title="Spinner" description="An animated loading indicator.">
        <Example title="Default">
          <Spinner />
        </Example>

        <Example title="Sizes">
          <Spinner className="size-4" />
          <Spinner className="size-6" />
          <Spinner className="size-8" />
        </Example>

        <Example title="Inline with text">
          <span className="text-muted-foreground flex items-center gap-2 text-sm">
            <Spinner className="size-4" />
            Loading...
          </span>
        </Example>
      </ComponentSection>
  )
}
