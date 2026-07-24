'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CountBadge } from '@/components/ui/count-badge'
import { NotificationList } from '@/components/notification-center/notification-list'
import type { NotificationItem } from '@/components/notification-center/notification-list'

type NotificationCenterProps = {
  items: NotificationItem[]
  unreadCount?: number
  onItemClick?: (id: string) => void
  onMarkAllRead?: () => void
  onOpen?: (open: boolean) => void
  /** Controlled open state. */
  open?: boolean
  /** Width of the popover panel (Tailwind class). Defaults to `w-80`. */
  panelWidth?: string
  emptyMessage?: React.ReactNode
  className?: string
  panelClassName?: string
  triggerClassName?: string
}

const NOTIFICATION_EPOCH = new Date(0)

function NotificationCenter({
  items,
  unreadCount: unreadCountProp,
  onItemClick,
  onMarkAllRead,
  onOpen,
  open: controlledOpen,
  panelWidth = 'w-80',
  emptyMessage,
  className,
  panelClassName,
  triggerClassName,
}: NotificationCenterProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  // Stable calendar reference captured when the panel opens (not Date.now during render).
  const [now, setNow] = React.useState(NOTIFICATION_EPOCH)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) setNow(new Date())
      if (!isControlled) setInternalOpen(next)
      onOpen?.(next)
    },
    [isControlled, onOpen]
  )

  const derivedUnreadCount = React.useMemo(
    () => items.filter((n) => n.unread).length,
    [items]
  )
  const unreadCount = unreadCountProp ?? derivedUnreadCount
  const hasUnread = unreadCount > 0

  return (
    <div data-slot="notification-center" className={cn('inline-flex', className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ''}`}
            className={cn('relative overflow-visible', triggerClassName)}
          >
            <Bell />
            {hasUnread ? (
              <CountBadge
                count={unreadCount}
                size="overlay"
                className="absolute -top-1 -right-1 z-10"
              />
            ) : null}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          data-ui="notification-center-content"
          className={cn('p-0', panelWidth, panelClassName)}
        >
        {/* Header */}
        <div
          data-slot="notification-center-header"
          className="flex items-center justify-between px-3 py-2.5"
        >
          <span className="text-sm font-medium">Notifications</span>
          {hasUnread && onMarkAllRead ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={onMarkAllRead}
              className="text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          ) : null}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="max-h-[min(480px,60dvh)]">
          <NotificationList
            items={items}
            now={now}
            onItemClick={onItemClick}
            emptyMessage={emptyMessage}
          />
        </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { NotificationCenter }
export type { NotificationCenterProps }
export type { NotificationItem }
