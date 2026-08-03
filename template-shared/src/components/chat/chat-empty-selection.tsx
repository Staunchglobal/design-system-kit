'use client'

import * as React from 'react'
import { MessagesSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatEmptyState } from '@/components/chat/chat-empty-state'

export type ChatEmptySelectionProps = {
  onNewChat?: () => void
}

export function ChatEmptySelection({
  onNewChat,
}: ChatEmptySelectionProps): React.JSX.Element {
  return (
    <div className="hidden h-full items-center justify-center border-l p-8 lg:flex">
      <ChatEmptyState
        icon={<MessagesSquare />}
        title="No conversation selected"
        description="Pick a chat from the sidebar to read and reply, or start a new one."
        action={
          onNewChat ? (
            <Button
              type="button"
              variant="outline"
              onClick={onNewChat}
            >
              <Plus />
              Add Chat
            </Button>
          ) : null
        }
      />
    </div>
  )
}
