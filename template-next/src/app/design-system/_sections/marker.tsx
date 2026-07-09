'use client'

import { CheckIcon, ClockIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'

export default function MarkerDemo() {
  return (
    <ComponentSection
        id="marker"
        title="Marker"
        description="Inline row marker for statuses, separators, and bordered groups."
      >
        <ExampleGrid>
          <Example title="Default" description="Status marker with icon and label.">
            <Marker>
              <MarkerIcon>
                <CheckIcon />
              </MarkerIcon>
              <MarkerContent>Deployed to production</MarkerContent>
            </Marker>
          </Example>
          <Example title="Separator" description="Labeled separator marker, e.g. a date divider.">
            <Marker variant="separator">
              <MarkerContent>Today</MarkerContent>
            </Marker>
          </Example>
          <Example title="Border" description="Bordered row marker, e.g. a section boundary.">
            <Marker variant="border">
              <MarkerIcon>
                <ClockIcon />
              </MarkerIcon>
              <MarkerContent>Waiting for review</MarkerContent>
            </Marker>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
