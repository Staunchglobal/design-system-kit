'use client'

import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Progress } from '@/components/ui/progress'

export default function ProgressDemo() {
  return (
    <ComponentSection
        id="progress"
        title="Progress"
        description="Displays an indicator showing the completion progress of a task."
      >
        <ExampleGrid>
          <Example title="25%">
            <Progress value={25} className="w-full" />
          </Example>
          <Example title="60%">
            <Progress value={60} className="w-full" />
          </Example>
          <Example title="100%">
            <Progress value={100} className="w-full" />
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
