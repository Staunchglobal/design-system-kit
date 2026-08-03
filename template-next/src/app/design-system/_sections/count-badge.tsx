import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { CountBadge } from '@/components/ui/count-badge'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

export default function CountBadgeDemo() {
  return (
    <ComponentSection
      id="count-badge"
      title="Count Badge"
      description="Numeric counter pill with a max+ cap. Named CountBadge to avoid colliding with Badge."
    >
      <ExampleGrid>
        <Example title="Default">
          <CountBadge count={3} />
        </Example>
        <Example title="Capped">
          <CountBadge count={150} max={99} />
        </Example>
        <Example title="On a button">
          <span className="relative inline-flex">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Notifications, 12 unread"
            >
              <Bell className="size-5" />
            </Button>
            <CountBadge
              count={12}
              size="overlay"
              className="absolute -top-1 -right-1 z-10"
            />
          </span>
        </Example>
        <Example title="Hidden when zero">
          <div className="flex items-center gap-2 text-sm">
            Zero → <CountBadge count={0} />
            <span className="text-muted-foreground">(renders nothing)</span>
          </div>
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
