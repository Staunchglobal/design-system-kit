'use client'

import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { StepperInput } from '@/components/ui/stepper-input'

export default function StepperInputDemo() {
  const [value, setValue] = React.useState<number | null>(2)
  const [unclamped, setUnclamped] = React.useState<number | null>(0)
  const [stepped, setStepped] = React.useState<number | null>(0)
  return (
    <ComponentSection
      id="stepper-input"
      title="Stepper Input"
      description="Numeric quantity field with decrement/increment buttons."
    >
      <ExampleGrid>
        <Example title="Clamped 0-10">
          <StepperInput value={value} onChange={setValue} min={0} max={10} />
        </Example>
        <Example title="Unclamped (no min/max)">
          <StepperInput value={unclamped} onChange={setUnclamped} />
        </Example>
        <Example title="Custom step (5)">
          <StepperInput value={stepped} onChange={setStepped} step={5} min={-20} max={20} />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
