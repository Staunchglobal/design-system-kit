import type * as React from 'react'
import type { ApiNotification } from '@/components/notification-center/notification-operations'
import type { NotificationItem } from '@/components/notification-center/notification-list'

// The backend deliberately stores no title/body copy for a notification —
// only `notificationType` + `metadata` (see the gem's own
// `SaasKit::Notification` comment: display text is derived, not stored, so
// re-wording a notification type's copy later needs no data migration).
// This default humanizes the type string as the title and leaves the
// description blank — pass your own `describe` function to
// `mapApiNotification`/`useNotifications` to render real copy per
// `notificationType` (e.g. `"invitation_accepted"` -> "Alice accepted your
// invitation", using `metadata.invitedByName`).
function humanizeNotificationType(type: string): string {
  return type
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export type DescribeNotification = (notification: ApiNotification) => {
  title: React.ReactNode
  description?: React.ReactNode
}

const defaultDescribe: DescribeNotification = (notification) => ({
  title: humanizeNotificationType(notification.notificationType),
})

export function mapApiNotification(
  notification: ApiNotification,
  describe: DescribeNotification = defaultDescribe
): NotificationItem {
  const { title, description } = describe(notification)
  return {
    id: notification.id,
    type: notification.notificationType,
    title,
    description,
    timestamp: notification.createdAt,
    unread: !notification.read,
  }
}

export { humanizeNotificationType }
