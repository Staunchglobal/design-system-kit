import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Truncate } from '@/components/ui/truncate'

const LONG =
  'Clinical note: Patient reports intermittent headaches over the past two weeks, worse in the evenings. Sleep is disrupted. No fever. Recommended hydration, OTC analgesia, and follow-up if symptoms persist beyond seven days. Additional context for expansion testing.'

export default function TruncateDemo() {
  return (
    <ComponentSection id="truncate" title="Truncate" description="Tooltip on overflow, or multi-line clamp with see more/less.">
      <ExampleGrid>
        <Example title="Tooltip mode" contentClassName="block w-48">
          <Truncate text="This is a long single-line label that should truncate with a tooltip." />
        </Example>
        <Example title="Expand mode" contentClassName="block max-w-md">
          <Truncate text={LONG} mode="expand" maxLines={3} />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
