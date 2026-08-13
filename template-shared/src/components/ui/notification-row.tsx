'use client'

import * as React from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  Beaker,
  Bell,
  Calendar,
  CalendarX,
  Flag,
  MessageSquare,
  Package,
  Pill,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Item, ItemContent, ItemDescription, ItemMedia } from '@/components/ui/item'

type NotificationType =
  | 'lab_results'
  | 'appointment'
  | 'appointment_cancelled'
  | 'message'
  | 'prescription'
  | 'flagged'
  | 'order'
  | 'default'

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  lab_results: <Beaker className="size-4" />,
  appointment: <Calendar className="size-4" />,
  appointment_cancelled: <CalendarX className="size-4" />,
  message: <MessageSquare className="size-4" />,
  prescription: <Pill className="size-4" />,
  flagged: <Flag className="size-4" />,
  order: <Package className="size-4" />,
  default: <Bell className="size-4" />,
}

function notificationTypeIcon(type: string): React.ReactNode {
  return TYPE_ICONS[type as NotificationType] ?? TYPE_ICONS.default
}

type NotificationRowProps = {
  type: NotificationType | string
  title: React.ReactNode
  description?: React.ReactNode
  timestamp: Date | string
  unread?: boolean
  onPress?: () => void
  className?: string
}

function NotificationRow({
  type,
  title,
  description,
  timestamp,
  unread = false,
  onPress,
  className,
}: NotificationRowProps) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const relative = Number.isNaN(date.getTime())
    ? String(timestamp)
    : formatDistanceToNowStrict(date, { addSuffix: true })

  return (
    <Item
      data-slot="notification-row"
      data-unread={unread ? 'true' : undefined}
      variant="default"
      className={cn(
        'flex-nowrap items-start w-full min-w-0 gap-3 py-3 overflow-hidden hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:ring-neutral-400 dark:hover:bg-neutral-800 dark:focus-visible:bg-neutral-800 dark:focus-visible:ring-neutral-500',
        onPress && 'cursor-pointer',
        className
      )}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      onClick={onPress}
      onKeyDown={
        onPress
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPress()
              }
            }
          : undefined
      }
    >
      <ItemMedia
        data-slot="notification-row-media"
        variant="icon"
        className="size-9 self-start rounded-lg bg-neutral-100 text-muted-foreground transition-colors duration-100 group-has-data-[slot=item-description]/item:translate-y-0 group-hover/item:bg-neutral-0 group-focus-visible/item:bg-neutral-0 dark:bg-neutral-800 dark:group-hover/item:bg-neutral-900 dark:group-focus-visible/item:bg-neutral-900"
      >
        {notificationTypeIcon(type)}
      </ItemMedia>
      <ItemContent className="min-w-0 overflow-hidden">
        <div data-slot="notification-row-header" className="flex w-full min-w-0 items-start justify-between gap-2">
          <div
            data-slot="notification-row-title"
            className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm leading-5 font-medium"
          >
            <span data-slot="notification-row-title-text" className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {title}
            </span>
            {unread ? (
              <span
                data-slot="notification-unread-dot"
                className="bg-primary size-2 shrink-0 rounded-full"
                aria-label="Unread"
              />
            ) : null}
          </div>
          <time
            data-slot="notification-row-time"
            className="text-muted-foreground flex-none pt-0.5 text-xs whitespace-nowrap"
            dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()}
          >
            {relative}
          </time>
        </div>
        {description ? (
          <ItemDescription className="min-w-0 overflow-hidden text-ellipsis">{description}</ItemDescription>
        ) : null}
      </ItemContent>
    </Item>
  )
}

export { NotificationRow, notificationTypeIcon }
export type { NotificationRowProps, NotificationType }
