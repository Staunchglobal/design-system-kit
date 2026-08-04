'use client'

import { useRouter } from 'next/navigation'
import { ChatInbox } from '@/components/chat/chat-inbox'
import { chatHref } from '@/app/(app)/chat/chat-href'
import type { ChatTab } from '@/components/chat/types'

// Static property access so Next.js can inline NEXT_PUBLIC_* at build time.
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL

// Auth is already guaranteed by the (app)/layout.tsx wrapping every route
// this component renders under — no session check needed here.
export function ChatApp({
  chatId,
  tab,
}: {
  chatId: string | null
  tab: ChatTab
}) {
  const router = useRouter()

  return (
    <div className="box-border flex h-dvh w-full flex-col p-2 sm:p-4">
      <ChatInbox
        className="min-h-0 flex-1"
        graphqlUrl={GRAPHQL_URL}
        graphqlWsUrl={GRAPHQL_WS_URL}
        chatId={chatId}
        tab={tab}
        onTabChange={(next) => {
          router.push(chatHref(null, next))
        }}
        onChatIdChange={(id, options) => {
          router.push(chatHref(id, options?.tab ?? tab))
        }}
      />
    </div>
  )
}

export { chatHref } from '@/app/(app)/chat/chat-href'
