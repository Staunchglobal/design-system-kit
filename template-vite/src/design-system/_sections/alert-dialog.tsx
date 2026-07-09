import { Trash2 } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

function AlertDialogSection() {
  return (
    <Example title="Destructive confirmation" description="Delete item?">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete item</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item and remove it from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Example>
  )
}

export default function AlertDialogDemo() {
  return (
    <ComponentSection
        id="alert-dialog"
        title="Alert Dialog"
        description="Interrupts the user with a mandatory confirmation."
      >
        <AlertDialogSection />
      </ComponentSection>
  )
}
