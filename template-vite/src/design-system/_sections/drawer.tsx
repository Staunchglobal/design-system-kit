import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'

function DrawerSection() {
  return (
    <Example title="Basic drawer" description="vaul-based drawer sliding from the bottom">
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="text-muted-foreground px-4 text-sm">
            Use the buttons below to adjust the goal, or drag the handle down to dismiss.
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Example>
  )
}

export default function DrawerDemo() {
  return (
    <ComponentSection
        id="drawer"
        title="Drawer"
        description="vaul-based drawer, typically used on touch/mobile surfaces."
      >
        <DrawerSection />
      </ComponentSection>
  )
}
