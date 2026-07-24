'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import {
  ChatErrorBanner,
  ChatListSkeleton,
} from '@/components/chat/chat-status'
import type { ChatUser } from '@/components/chat/types'

export type AddChatDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: ChatUser[]
  loading?: boolean
  creating?: boolean
  error?: string | null
  createError?: string | null
  onRetry?: () => void
  search: string
  onSearchChange: (v: string) => void
  onSelect: (userId: string) => void
}

export function AddChatDialog({
  open,
  onOpenChange,
  users,
  loading,
  creating,
  error,
  createError,
  onRetry,
  search,
  onSearchChange,
  onSelect,
}: AddChatDialogProps): React.JSX.Element {
  const busy = Boolean(loading || creating)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search people…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={busy}
        />
        {error ? (
          <ChatErrorBanner
            title="Couldn't load people"
            message={error}
            onRetry={onRetry}
          />
        ) : null}
        {createError ? (
          <ChatErrorBanner title="Couldn't start chat" message={createError} />
        ) : null}
        <ScrollArea className="h-64">
          <div className="flex flex-col gap-1 pr-2">
            {loading && users.length === 0 && !error ? <ChatListSkeleton rows={5} /> : null}
            {!loading && !error && users.length === 0 ? (
              <p className="text-muted-foreground p-2 text-sm">No users found</p>
            ) : null}
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                disabled={busy}
                className="hover:bg-muted flex items-center gap-3 rounded-lg p-2 text-left disabled:opacity-50"
                onClick={() => onSelect(u.id)}
              >
                <Avatar className="size-8">
                  <AvatarFallback>
                    {u.fullName
                      .split(/\s+/)
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.fullName}</p>
                  <p className="text-muted-foreground truncate text-xs">{u.email}</p>
                </div>
                {creating ? <Spinner className="size-3.5 shrink-0 opacity-0" /> : null}
              </button>
            ))}
            {creating ? (
              <p className="text-muted-foreground flex items-center gap-2 p-2 text-sm">
                <Spinner className="size-3.5" />
                Starting conversation…
              </p>
            ) : null}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
