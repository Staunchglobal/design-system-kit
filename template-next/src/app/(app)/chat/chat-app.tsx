'use client'

import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/components/auth/use-current-user'
import { ChatInbox } from '@/components/chat/chat-inbox'
import { chatHref } from '@/app/(app)/chat/chat-href'
import type { ChatTab } from '@/components/chat/types'

// Static property access so Next.js can inline NEXT_PUBLIC_* at build time.
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL

// Auth is already guaranteed by the (app)/layout.tsx wrapping every route
// this component renders under — the ability check below is what actually
// gates *this* feature specifically (chat can be restricted to specific
// roles via the feature-flags admin matrix; hiding the nav link isn't
// enough on its own since every route here is still directly reachable by
// URL).
export function ChatApp({
  chatId,
  tab,
}: {
  chatId: string | null
  tab: ChatTab
}) {
  const router = useRouter()
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('chat:access')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

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
