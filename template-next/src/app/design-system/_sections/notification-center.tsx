'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { NotificationCenter, type NotificationItem } from '@/components/ui/notification-center'

const DEMO_ITEMS: NotificationItem[] = [
  {
    id: '1',
    type: 'message',
    title: 'New message from Alex',
    description: 'Can we move tomorrow\'s session?',
    timestamp: '2026-07-18T10:15:00.000Z',
    unread: true,
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Appointment confirmed',
    description: 'Tue 2:00 PM with Dr. Rivera',
    timestamp: '2026-07-18T08:00:00.000Z',
    unread: true,
  },
  {
    id: '3',
    type: 'order',
    title: 'Order shipped',
    description: 'Tracking #A18420',
    timestamp: '2026-07-17T16:30:00.000Z',
    unread: false,
  },
]

export default function NotificationCenterDemo() {
  const [items, setItems] = React.useState(DEMO_ITEMS)

  return (
    <ComponentSection
      id="notification-center"
      title="Notification Center"
      description="Bell trigger with CountBadge overlay, popover list grouped by date, and mark-all-read."
    >
      <Example title="Popover center" contentClassName="flex justify-end">
        <NotificationCenter
          items={items}
          onItemClick={(id) =>
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
          }
          onMarkAllRead={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
        />
      </Example>
    </ComponentSection>
  )
}
