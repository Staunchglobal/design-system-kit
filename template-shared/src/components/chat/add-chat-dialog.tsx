'use client'

import * as React from 'react'
import { Check, SearchX, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import {
  ChatErrorBanner,
  ChatListSkeleton,
} from '@/components/chat/chat-status'
import { ChatEmptyState } from '@/components/chat/chat-empty-state'
import { ChatSearchField } from '@/components/chat/chat-search-field'
import type { ChatUser } from '@/components/chat/types'
import { personInitials, personLabels } from '@/components/chat/chat-utils'
import { cn } from '@/lib/utils'

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
  searching?: boolean
  onSelect: (userId: string) => void
}

/**
 * Add-chat picker: search people, select one, then submit.
 */
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
  searching,
  onSelect,
}: AddChatDialogProps): React.JSX.Element {
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [prevOpen, setPrevOpen] = React.useState(open)
  const busy = Boolean(creating)
  const listLoading = Boolean(searching || loading)

  // Clear selection whenever the dialog opens or closes.
  if (open !== prevOpen) {
    setPrevOpen(open)
    setSelectedId(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || busy) return
    onSelect(selectedId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            {/* Keeps the title clear of the pinned close button. */}
            <DialogTitle className="pr-8">Add Chat</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <ChatSearchField
              value={search}
              onChange={onSearchChange}
              searching={searching}
              placeholder="Search people…"
              aria-label="Search people"
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

            <div className="scrollbar-thin -mx-1 max-h-64 overflow-y-auto overscroll-contain">
              <div className="flex flex-col gap-0.5 px-1">
                {listLoading && users.length === 0 && !error ? (
                  <ChatListSkeleton rows={5} />
                ) : null}
                {!listLoading && !error && users.length === 0 ? (
                  <ChatEmptyState
                    size="sm"
                    icon={search ? <SearchX /> : <UsersRound />}
                    title={search ? 'No people found' : 'No people available'}
                    description={
                      search
                        ? 'Try a different name or email.'
                        : "There's nobody here you can start a chat with yet."
                    }
                  />
                ) : null}
                {users.map((u) => {
                  const selected = selectedId === u.id
                  const { primary, secondary } = personLabels(u.fullName, u.email)
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={busy || listLoading}
                      aria-pressed={selected}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors disabled:opacity-50',
                        selected ? 'bg-primary/10' : 'hover:bg-muted'
                      )}
                      onClick={() => setSelectedId(u.id)}
                    >
                      <Avatar>
                        {u.imageUrl ? <AvatarImage src={u.imageUrl} alt={primary} /> : null}
                        <AvatarFallback>{personInitials(u.fullName, u.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{primary}</p>
                        {secondary ? (
                          <p className="text-muted-foreground truncate text-xs">{secondary}</p>
                        ) : null}
                      </div>
                      {selected ? <Check className="text-primary size-4 shrink-0" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedId || busy || listLoading}>
              {creating ? (
                <>
                  <Spinner className="size-3.5" />
                  Adding…
                </>
              ) : (
                'Add Chat'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
