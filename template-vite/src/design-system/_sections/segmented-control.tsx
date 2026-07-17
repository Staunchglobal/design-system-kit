import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { SegmentedControl } from '@/components/ui/segmented-control'

export default function SegmentedControlDemo() {
  const [value, setValue] = React.useState('all')
  const [view, setView] = React.useState('board')
  return (
    <ComponentSection
      id="segmented-control"
      title="Segmented Control"
      description="ToggleGroup on desktop; Select below the mobile breakpoint."
    >
      <ExampleGrid>
        <Example title="With counts">
          <SegmentedControl
            ariaLabel="Filter status"
            value={value}
            onValueChange={setValue}
            options={[
              { value: 'all', label: 'All', count: 12 },
              { value: 'open', label: 'Open', count: 4 },
              { value: 'closed', label: 'Closed', count: 8 },
            ]}
          />
        </Example>
        <Example title="Without counts">
          <SegmentedControl
            ariaLabel="View"
            value={view}
            onValueChange={setView}
            options={[
              { value: 'board', label: 'Board' },
              { value: 'list', label: 'List' },
              { value: 'calendar', label: 'Calendar' },
            ]}
          />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
