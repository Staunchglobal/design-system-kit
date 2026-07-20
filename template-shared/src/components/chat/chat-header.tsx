'use client'

import { Archive, ArchiveRestore } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ChatHeader({
  name,
  avatar,
  email,
  archived,
  onArchiveToggle,
}: {
  name: string
  avatar?: string | null
  email?: string | null
  archived?: boolean
  onArchiveToggle?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9">
          {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          {email ? <p className="text-muted-foreground truncate text-xs">{email}</p> : null}
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
