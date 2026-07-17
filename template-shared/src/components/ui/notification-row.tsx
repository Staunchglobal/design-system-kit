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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'

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
      variant={unread ? 'muted' : 'default'}
      className={cn(onPress && 'cursor-pointer', className)}
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
      <ItemMedia variant="icon" className="bg-muted flex size-9 items-center justify-center rounded-lg">
        {notificationTypeIcon(type)}
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="gap-2">
          {title}
          {unread ? (
            <span
              data-slot="notification-unread-dot"
              className="bg-primary size-2 shrink-0 rounded-full"
              aria-label="Unread"
            />
          ) : null}
        </ItemTitle>
        {description ? <ItemDescription>{description}</ItemDescription> : null}
      </ItemContent>
      <ItemActions>
        <time
          dateTime={Number.isNaN(date.getTime()) ? undefined : date.toISOString()}
          className="text-muted-foreground text-xs whitespace-nowrap"
        >
          {relative}
        </time>
      </ItemActions>
    </Item>
  )
}

export { NotificationRow, notificationTypeIcon }
export type { NotificationRowProps, NotificationType }
