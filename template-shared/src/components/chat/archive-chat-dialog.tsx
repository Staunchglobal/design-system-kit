'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChatBusyLabel, ChatErrorBanner } from '@/components/chat/chat-status'

export type ArchiveChatDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  archived: boolean
  onConfirm: () => void
  onRetry?: () => void
  loading?: boolean
  error?: string | null
}

export function ArchiveChatDialog({
  open,
  onOpenChange,
  archived,
  onConfirm,
  onRetry,
  loading,
  error,
}: ArchiveChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{archived ? 'Unarchive chat?' : 'Archive chat?'}</DialogTitle>
          <DialogDescription>
            {archived
              ? 'This conversation will move back to your active inbox.'
              : 'This conversation will move to Archived. You can restore it later.'}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <ChatErrorBanner
            title={archived ? "Couldn't unarchive" : "Couldn't archive"}
            message={error}
            onRetry={onRetry ?? onConfirm}
          />
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            <ChatBusyLabel
              busy={loading}
              idle={archived ? 'Unarchive' : 'Archive'}
              busyLabel={archived ? 'Unarchiving…' : 'Archiving…'}
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
