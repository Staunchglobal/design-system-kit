'use client'

import * as React from 'react'
import { getAuthSession } from '@/components/auth/auth-session'
import { toast } from '@/components/auth/notify'
import { createNotificationFetch } from '@/components/notification-center/notification-fetch'
import { createNotificationSubscriptions } from '@/components/notification-center/notification-subscribe'
import {
  NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
  NOTIFICATION_UPDATED,
  type ApiNotification,
  type NotificationsResult,
  type MarkNotificationAsReadResult,
  type MarkAllNotificationsAsReadResult,
  type NotificationUpdatedResult,
} from '@/components/notification-center/notification-operations'
import {
  mapApiNotification,
  type DescribeNotification,
} from '@/components/notification-center/notification-mappers'
import type { NotificationItem } from '@/components/notification-center/notification-list'

export type UseNotificationsOptions = {
  graphqlUrl?: string
  graphqlWsUrl?: string
  currentUserId?: string
  perPage?: number
  /** Renders real title/description per `notificationType` — see notification-mappers.ts. */
  describe?: DescribeNotification
}

export type UseNotificationsResult = {
  items: NotificationItem[]
  unreadCount: number
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications({
  graphqlUrl,
  graphqlWsUrl,
  currentUserId: currentUserIdProp,
  perPage = 20,
  describe,
}: UseNotificationsOptions = {}): UseNotificationsResult {
  const session = getAuthSession()
  const currentUserId = currentUserIdProp ?? session?.user.id ?? 'user_demo'

  const notificationFetch = React.useMemo(
    () => createNotificationFetch(graphqlUrl ? { endpoint: graphqlUrl } : {}),
    [graphqlUrl]
  )
  const subs = React.useMemo(
    () => createNotificationSubscriptions({ url: graphqlWsUrl }),
    [graphqlWsUrl]
  )

  const [rows, setRows] = React.useState<ApiNotification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [nextPage, setNextPage] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(
    async (page = 1, append = false): Promise<void> => {
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError(null)
      try {
        const data = await notificationFetch<NotificationsResult>(NOTIFICATIONS, { page, perPage })
        const { notifications, pagination } = data.notifications
        setRows((prev) => (append ? [...prev, ...notifications] : notifications))
        setUnreadCount(data.notifications.unreadCount)
        setNextPage(pagination.page < pagination.pages ? pagination.page + 1 : null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load notifications'
        setError(message)
        if (!append) setRows([])
        toast.error(message)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [notificationFetch, perPage]
  )

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kick off the initial/refetch load
    void load(1, false)
  }, [load])

  React.useEffect(() => {
    return subs.subscribe(
      NOTIFICATION_UPDATED,
      { userId: currentUserId },
      (data: NotificationUpdatedResult) => {
        const update = data.notificationUpdated
        if (!update) return
        const { event, notification, unreadCount: nextUnread } = update
        setUnreadCount(nextUnread)

        if (event === 'all_read') {
          setRows((prev) => prev.map((n) => (n.read ? n : { ...n, read: true, readAt: new Date().toISOString() })))
          return
        }
        if (!notification) return

        if (event === 'deleted') {
          setRows((prev) => prev.filter((n) => n.id !== notification.id))
          return
        }
        setRows((prev) => {
          const exists = prev.some((n) => n.id === notification.id)
          if (exists) return prev.map((n) => (n.id === notification.id ? notification : n))
          return [notification, ...prev]
        })
      }
    )
  }, [currentUserId, subs])

  async function markAsRead(id: string): Promise<void> {
    const target = rows.find((n) => n.id === id)
    if (!target || target.read) return
    setRows((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    try {
      await notificationFetch<MarkNotificationAsReadResult>(MARK_NOTIFICATION_AS_READ, {
        input: { notificationId: id },
      })
    } catch (err) {
      // Revert the optimistic update — the subscription push (if any arrives
      // later) would otherwise be the only thing to notice this failed.
      setRows((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      setUnreadCount((prev) => prev + 1)
      toast.error(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }

  async function markAllAsRead(): Promise<void> {
    const previousRows = rows
    const previousUnread = unreadCount
    setRows((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
    setUnreadCount(0)
    try {
      await notificationFetch<MarkAllNotificationsAsReadResult>(MARK_ALL_NOTIFICATIONS_AS_READ)
    } catch (err) {
      setRows(previousRows)
      setUnreadCount(previousUnread)
      toast.error(err instanceof Error ? err.message : 'Failed to mark all notifications as read')
    }
  }

  return {
    items: rows.map((n) => mapApiNotification(n, describe)),
    unreadCount,
    loading,
    loadingMore,
    error,
    hasMore: nextPage != null,
    loadMore: () => {
      if (nextPage) void load(nextPage, true)
    },
    refresh: () => load(1, false),
    markAsRead,
    markAllAsRead,
  }
}
