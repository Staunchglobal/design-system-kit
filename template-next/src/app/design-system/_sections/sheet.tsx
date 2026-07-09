'use client'

import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

function SheetSection() {
  return (
    <ExampleGrid>
      {(['right', 'left', 'top', 'bottom'] as const).map((side) => (
        <Example key={side} title={`Sheet — side="${side}"`}>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="capitalize">
                Open {side}
              </Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>Edit notification settings</SheetTitle>
                <SheetDescription>
                  Choose how you want to be notified about activity.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-3 px-4">
                <div className="grid gap-1.5">
                  <Label htmlFor={`sheet-email-${side}`}>Email</Label>
                  <Input id={`sheet-email-${side}`} defaultValue="jane@example.com" />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Example>
      ))}
    </ExampleGrid>
  )
}

export default function SheetDemo() {
  return (
    <ComponentSection
        id="sheet"
        title="Sheet"
        description="Panel that slides in from an edge of the screen."
      >
        <SheetSection />
      </ComponentSection>
  )
}
