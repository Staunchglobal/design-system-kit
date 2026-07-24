'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { ItemGroup } from '@/components/ui/item'
import { NotificationRow } from '@/components/ui/notification-row'

const DEMO_TIMESTAMPS = {
  hourAgo: new Date('2026-07-17T12:00:00.000Z'),
  dayAgo: new Date('2026-07-16T13:00:00.000Z'),
  tenMinAgo: new Date('2026-07-17T12:50:00.000Z'),
} as const

export default function NotificationRowDemo() {
  return (
    <ComponentSection
      id="notification-row"
      title="Notification Row"
      description="Activity list row built on Item, with unread state and relative time."
    >
      <Example title="List" contentClassName="block w-full max-w-lg">
        <ItemGroup className="gap-2">
          <NotificationRow
            type="appointment"
            title="Upcoming visit"
            description="Dr. Smith · Tomorrow 10:00"
            timestamp={DEMO_TIMESTAMPS.hourAgo}
            unread
            onPress={() => {}}
          />
          <NotificationRow
            type="lab_results"
            title="Lab results ready"
            timestamp={DEMO_TIMESTAMPS.dayAgo}
          />
          <NotificationRow
            type="message"
            title="New message"
            description="Please confirm your address."
            timestamp={DEMO_TIMESTAMPS.tenMinAgo}
            unread
          />
        </ItemGroup>
      </Example>
    </ComponentSection>
  )
}
