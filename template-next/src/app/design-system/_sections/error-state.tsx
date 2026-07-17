'use client'

import { CloudOff } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { ErrorState } from '@/components/ui/error-state'

export default function ErrorStateDemo() {
  return (
    <ComponentSection id="error-state" title="Error State" description="Empty-state layout themed for failures, with optional retry.">
      <ExampleGrid>
        <Example title="With retry" contentClassName="block">
          <ErrorState onRetry={() => {}} />
        </Example>
        <Example title="No retry action" contentClassName="block">
          <ErrorState title="Data unavailable" description="This report couldn't be loaded right now." />
        </Example>
        <Example title="Custom title, description, and icon" contentClassName="block">
          <ErrorState
            title="You're offline"
            description="Check your connection and try again."
            icon={<CloudOff />}
            onRetry={() => {}}
            retryLabel="Retry connection"
          />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
