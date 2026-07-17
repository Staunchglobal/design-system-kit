import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Stepper, StepperItem } from '@/components/ui/stepper'

export default function StepperDemo() {
  return (
    <ComponentSection id="stepper" title="Stepper" description="Visual step indicator — numbered circles or segmented progress bar.">
      <ExampleGrid>
        <Example title="Circles" contentClassName="block w-full">
          <Stepper>
            <StepperItem state="complete" label="Account" />
            <StepperItem state="active" label="Profile" description="Almost done" />
            <StepperItem state="upcoming" label="Confirm" />
          </Stepper>
        </Example>
        <Example title="Segments" contentClassName="block w-full">
          <Stepper variant="segments" currentStep={2} totalSteps={4} />
        </Example>
        <Example title="Error state" contentClassName="block w-full">
          <Stepper>
            <StepperItem state="complete" label="Account" />
            <StepperItem state="error" label="Payment" description="Card declined" />
            <StepperItem state="upcoming" label="Confirm" />
          </Stepper>
        </Example>
        <Example title="Vertical orientation" contentClassName="block w-full max-w-xs">
          <Stepper orientation="vertical">
            <StepperItem state="complete" label="Account" />
            <StepperItem state="active" label="Profile" description="Almost done" />
            <StepperItem state="upcoming" label="Confirm" />
          </Stepper>
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
