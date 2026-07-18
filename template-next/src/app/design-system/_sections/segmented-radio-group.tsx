'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { SegmentedRadioGroup } from '@/components/ui/segmented-radio-group'

type Plan = 'starter' | 'pro' | 'enterprise'

export default function SegmentedRadioGroupDemo() {
  const [plan, setPlan] = React.useState<Plan>('pro')

  return (
    <ComponentSection
      id="segmented-radio-group"
      title="Segmented Radio Group"
      description="Form answer as bordered option cards — distinct from Segmented Control view switching."
    >
      <Example title="Plan selection" contentClassName="block w-full max-w-md">
        <SegmentedRadioGroup
          value={plan}
          onValueChange={setPlan}
          aria-label="Plan"
          options={[
            { value: 'starter', label: 'Starter', description: 'For solo builders' },
            { value: 'pro', label: 'Pro', description: 'Teams shipping products' },
            { value: 'enterprise', label: 'Enterprise', description: 'Custom security & SLAs' },
          ]}
        />
      </Example>
    </ComponentSection>
  )
}
