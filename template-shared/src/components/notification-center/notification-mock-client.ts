/**
 * In-memory dummy GraphQL notifications API + EventTarget subscriptions.
 * Same fetch signature as graphqlFetch so pages can swap endpoint + fetchImpl.
 */

import type { ApiNotification } from '@/components/notification-center/notification-operations'

export const NOTIFICATION_MOCK_ENDPOINT = 'mock://notifications'

type Unsubscribe = () => void

const bus = new EventTarget()

const notifications = new Map<string, ApiNotification>()

let seeded = false

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query|subscription)\s+(\w+)/)
  return m?.[1] ?? ''
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function seed() {
  if (seeded) return
  seeded = true

  const now = Date.now()
  const seeds: ApiNotification[] = [
    {
      id: uid('notif'),
      notificationType: 'invitation_accepted',
      notifiableType: null,
      notifiableId: null,
      read: false,
      readAt: null,
      metadata: { invitedByName: 'Alice Johnson' },
      createdAt: new Date(now - 5 * 60_000).toISOString(),
    },
    {
      id: uid('notif'),
      notificationType: 'role_granted',
      notifiableType: null,
      notifiableId: null,
      read: false,
      readAt: null,
      metadata: { role: 'manager' },
      createdAt: new Date(now - 3600_000).toISOString(),
    },
    {
      id: uid('notif'),
      notificationType: 'password_changed',
      notifiableType: null,
      notifiableId: null,
      read: true,
      readAt: new Date(now - 7200_000).toISOString(),
      metadata: {},
      createdAt: new Date(now - 86_400_000).toISOString(),
    },
  ]
  for (const n of seeds) notifications.set(n.id, n)
}

function unreadCount(): number {
  return [...notifications.values()].filter((n) => !n.read).length
}

function paginationMeta(total: number, page: number, perPage: number) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  return { page, pages, count: total, perPage }
}

function publish(kind: string, detail: unknown) {
  bus.dispatchEvent(new CustomEvent(kind, { detail }))
}

export async function notificationMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {},
  _headers?: HeadersInit
): Promise<T> {
  seed()
  await delay()
  const name = opName(query)
  const v = variables

  switch (name) {
    case 'Notifications': {
      const read = v.read as boolean | undefined
      const page = Number(v.page ?? 1)
      const perPage = Number(v.perPage ?? 20)
      let list = [...notifications.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      if (read !== undefined) list = list.filter((n) => n.read === read)
      const slice = list.slice((page - 1) * perPage, page * perPage)
      return {
        notifications: {
          unreadCount: unreadCount(),
          pagination: paginationMeta(list.length, page, perPage),
          notifications: slice,
        },
      } as T
    }

    case 'MarkNotificationAsRead': {
      const id = String((v.input as { notificationId?: string } | undefined)?.notificationId ?? '')
      const notification = notifications.get(id)
      if (notification && !notification.read) {
        notification.read = true
        notification.readAt = new Date().toISOString()
        publish('notificationUpdated', { event: 'updated', notification, unreadCount: unreadCount() })
      }
      return {
        markNotificationAsRead: { success: true, notification: notification ?? null },
      } as T
    }

    case 'MarkAllNotificationsAsRead': {
      let updatedCount = 0
      for (const n of notifications.values()) {
        if (!n.read) {
          n.read = true
          n.readAt = new Date().toISOString()
          updatedCount += 1
        }
      }
      publish('notificationUpdated', { event: 'all_read', notification: null, unreadCount: unreadCount() })
      return { markAllNotificationsAsRead: { success: true, updatedCount } } as T
    }

    default:
      throw new Error(`Unknown notification mock operation: ${name || '(empty)'}`)
  }
}

export type MockSubscribeOptions = {
  variables: Record<string, unknown>
  onData: (data: unknown) => void
}

export function notificationMockSubscribe(options: MockSubscribeOptions): Unsubscribe {
  seed()
  const handler = (event: Event) => {
    const detail = (event as CustomEvent).detail as Record<string, unknown>
    options.onData({ notificationUpdated: detail })
  }
  bus.addEventListener('notificationUpdated', handler)
  return () => bus.removeEventListener('notificationUpdated', handler)
}

/** Test/demo helper — pushes a brand-new notification through the mock bus. */
export function notificationMockPush(notificationType: string, metadata: Record<string, unknown> = {}) {
  seed()
  const notification: ApiNotification = {
    id: uid('notif'),
    notificationType,
    notifiableType: null,
    notifiableId: null,
    read: false,
    readAt: null,
    metadata,
    createdAt: new Date().toISOString(),
  }
  notifications.set(notification.id, notification)
  publish('notificationUpdated', { event: 'created', notification, unreadCount: unreadCount() })
}
