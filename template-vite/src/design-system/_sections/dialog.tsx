import * as React from 'react'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function DialogSection() {
  const [controlledOpen, setControlledOpen] = React.useState(false)

  return (
    <ExampleGrid>
      <Example title="Uncontrolled dialog" description="Opened via DialogTrigger">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action can be undone later from your account settings.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example title="Controlled dialog" description="Open state lifted to React.useState">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setControlledOpen(true)}>
            Open controlled dialog
          </Button>
          <span className="text-muted-foreground text-xs">open: {String(controlledOpen)}</span>
        </div>
        <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled dialog</DialogTitle>
              <DialogDescription>
                This dialog&apos;s open state is owned by the parent component.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setControlledOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setControlledOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>

      <Example title="Dialog with form" description="Label + Input inside DialogContent">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="overlays-name">Name</Label>
                <Input id="overlays-name" defaultValue="Jane Doe" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="overlays-username">Username</Label>
                <Input id="overlays-username" defaultValue="@janedoe" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Example>
    </ExampleGrid>
  )
}

export default function DialogDemo() {
  return (
    <ComponentSection
        id="dialog"
        title="Dialog"
        description="Modal window layered over the page, rendered in a portal."
      >
        <DialogSection />
      </ComponentSection>
  )
}
