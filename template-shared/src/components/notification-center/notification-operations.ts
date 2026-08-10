// `notifications` is a resolver, not a RelayClassicMutation mutation — its
// arguments are flat, top-level query arguments, not wrapped in a single
// `$input` variable the way both mutations below are.
export const NOTIFICATIONS = `
  query Notifications($read: Boolean, $page: Int, $perPage: Int) {
    notifications(read: $read, page: $page, perPage: $perPage) {
      unreadCount
      pagination {
        page
        pages
        count
        perPage
      }
      notifications {
        id
        notificationType
        notifiableType
        notifiableId
        read
        readAt
        metadata
        createdAt
      }
    }
  }
`

export const MARK_NOTIFICATION_AS_READ = `
  mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
    markNotificationAsRead(input: $input) {
      success
      notification {
        id
        read
        readAt
      }
    }
  }
`

export const MARK_ALL_NOTIFICATIONS_AS_READ = `
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead(input: {}) {
      success
      updatedCount
    }
  }
`

// `event` is `"created" | "updated" | "deleted" | "all_read"` — `notification`
// is null only for `all_read` (a bulk mark-all-read has no single row to
// point at).
export const NOTIFICATION_UPDATED = `
  subscription NotificationUpdated($userId: ID!) {
    notificationUpdated(userId: $userId) {
      event
      unreadCount
      notification {
        id
        notificationType
        notifiableType
        notifiableId
        read
        readAt
        metadata
        createdAt
      }
    }
  }
`

export type ApiNotification = {
  id: string
  notificationType: string
  notifiableType?: string | null
  notifiableId?: string | null
  read: boolean
  readAt?: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export type NotificationsResult = {
  notifications: {
    unreadCount: number
    pagination: { page: number; pages: number; count: number; perPage: number }
    notifications: ApiNotification[]
  }
}

export type MarkNotificationAsReadResult = {
  markNotificationAsRead: { success: boolean; notification: ApiNotification | null }
}

export type MarkAllNotificationsAsReadResult = {
  markAllNotificationsAsRead: { success: boolean; updatedCount: number }
}

export type NotificationUpdatedResult = {
  notificationUpdated: {
    event: 'created' | 'updated' | 'deleted' | 'all_read'
    unreadCount: number
    notification: ApiNotification | null
  }
}
