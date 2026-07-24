'use client'

import * as React from 'react'
import { format, isSameDay, isValid, subDays } from 'date-fns'

import { cn } from '@/lib/utils'
import { NotificationRow } from '@/components/ui/notification-row'
import type { NotificationType } from '@/components/ui/notification-row'

type NotificationItem = {
  id: string
  type: NotificationType | string
  title: React.ReactNode
  description?: React.ReactNode
  timestamp: Date | string
  unread?: boolean
  onPress?: () => void
}

type DateGroup = {
  label: string
  sortKey: string
  items: NotificationItem[]
}

function toDate(ts: Date | string): Date {
  return typeof ts === 'string' ? new Date(ts) : ts
}

function getGroupLabel(date: Date, now: Date): string {
  if (!isValid(date)) return 'Earlier'
  if (isSameDay(date, now)) return 'Today'
  if (isSameDay(date, subDays(now, 1))) return 'Yesterday'
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMMM d')
  }
  return format(date, 'MMMM d, yyyy')
}

function getGroupSortKey(date: Date): string {
  return isValid(date) ? format(date, 'yyyy-MM-dd') : 'invalid'
}

function groupByDate(items: NotificationItem[], now: Date): DateGroup[] {
  const map = new Map<string, DateGroup>()

  for (const item of items) {
    const date = toDate(item.timestamp)
    const sortKey = getGroupSortKey(date)
    const label = getGroupLabel(date, now)

    let group = map.get(sortKey)
    if (!group) {
      group = { label, sortKey, items: [] }
      map.set(sortKey, group)
    }
    group.items.push(item)
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.sortKey === 'invalid') return 1
    if (b.sortKey === 'invalid') return -1
    return b.sortKey.localeCompare(a.sortKey)
  })
}

type NotificationListProps = {
  items: NotificationItem[]
  now: Date
  onItemClick?: (id: string) => void
  emptyMessage?: React.ReactNode
  className?: string
}

function NotificationList({
  items,
  now,
  onItemClick,
  emptyMessage,
  className,
}: NotificationListProps) {
  const groups = React.useMemo(() => groupByDate(items, now), [items, now])

  if (groups.length === 0) {
    return (
      <div
        data-slot="notification-list-empty"
        className={cn(
          'text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-sm',
          className
        )}
      >
        {emptyMessage ?? 'No notifications'}
      </div>
    )
  }

  return (
    <div data-slot="notification-list" className={cn('flex flex-col', className)}>
      {groups.map((group) => (
        <div key={group.sortKey} data-slot="notification-group">
          <div
            data-slot="notification-group-label"
            className="text-muted-foreground sticky top-0 bg-inherit px-3 py-1.5 text-xs font-medium"
          >
            {group.label}
          </div>
          {group.items.map((item) => (
            <NotificationRow
              key={item.id}
              type={item.type}
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              unread={item.unread}
              onPress={
                item.onPress || onItemClick
                  ? () => {
                      item.onPress?.()
                      onItemClick?.(item.id)
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { NotificationList, groupByDate }
export type { NotificationItem, NotificationListProps, DateGroup }
export type { NotificationType }
