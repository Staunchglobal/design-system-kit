import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'

function PopoverSection() {
  return (
    <Example title="Basic popover" description="Header, title, description and form content">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
          </PopoverHeader>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="popover-width">Width</Label>
              <Input id="popover-width" defaultValue="100%" className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              <Label htmlFor="popover-max-width">Max width</Label>
              <Input id="popover-max-width" defaultValue="300px" className="col-span-2" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Example>
  )
}

export default function PopoverDemo() {
  return (
    <ComponentSection
        id="popover"
        title="Popover"
        description="Non-modal floating content anchored to a trigger."
      >
        <PopoverSection />
      </ComponentSection>
  )
}
