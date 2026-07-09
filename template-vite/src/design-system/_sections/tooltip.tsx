import { Settings } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function TooltipSection() {
  return (
    <ExampleGrid>
      <Example title="Button trigger">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
      </Example>
      <Example title='Icon-only trigger — side="bottom"'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>
      </Example>
    </ExampleGrid>
  )
}

export default function TooltipDemo() {
  return (
    <ComponentSection
        id="tooltip"
        title="Tooltip"
        description="Short informational label shown on hover/focus."
      >
        <TooltipSection />
      </ComponentSection>
  )
}
