'use client'

import { ChevronLeft } from 'lucide-react'
import { Archive, ArchiveRestore } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { personInitials, personLabels } from '@/components/chat/chat-utils'

export function ChatHeader({
  name,
  avatar,
  email,
  archived,
  onArchiveToggle,
  onBackClick,
}: {
  name: string
  avatar?: string | null
  email?: string | null
  archived?: boolean
  onArchiveToggle?: () => void
  /** Mobile back — returns to the contacts list. */
  onBackClick?: () => void
}) {
  const { primary, secondary } = personLabels(name, email)

  return (
    <div className="bg-background sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onBackClick ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground shrink-0 lg:hidden"
            onClick={onBackClick}
            aria-label="Back to conversations"
          >
            <ChevronLeft className="size-5" />
          </Button>
        ) : null}
        <Avatar size="lg">
          {avatar ? <AvatarImage src={avatar} alt={primary} /> : null}
          <AvatarFallback>{personInitials(name, email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">{primary}</p>
          {secondary ? (
            <p className="text-muted-foreground truncate text-xs">{secondary}</p>
          ) : null}
        </div>
      </div>
      {onArchiveToggle ? (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onArchiveToggle}
          title={archived ? 'Unarchive' : 'Archive'}
          aria-label={archived ? 'Unarchive' : 'Archive'}
        >
          {archived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
        </Button>
      ) : null}
    </div>
  )
}
