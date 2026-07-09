import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

export default function CollapsibleDemo() {
  return (
    <ComponentSection
        id="collapsible"
        title="Collapsible"
        description="Toggle the visibility of a single content block."
      >
        <ExampleGrid>
          <Example title="Closed by default" contentClassName="block">
            <Collapsible className="w-full space-y-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  Toggle details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground rounded-md border p-3 text-sm">
                This content is hidden until the trigger is toggled open.
              </CollapsibleContent>
            </Collapsible>
          </Example>
          <Example title="Open by default" contentClassName="block">
            <Collapsible defaultOpen className="w-full space-y-2">
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  Toggle details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="text-muted-foreground rounded-md border p-3 text-sm">
                This content starts visible because defaultOpen is set.
              </CollapsibleContent>
            </Collapsible>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
