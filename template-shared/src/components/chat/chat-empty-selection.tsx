'use client'

import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export function ChatEmptySelection() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Select a conversation</EmptyTitle>
          <EmptyDescription>
            Choose a chat from the sidebar or start a new one.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
