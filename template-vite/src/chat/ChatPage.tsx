'use client'

import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCurrentUser } from '@/components/auth/use-current-user'
import { ChatInbox } from '@/components/chat/chat-inbox'
import type { ChatTab } from '@/components/chat/types'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL as string | undefined

function chatHref(chatId: string | null, tab: ChatTab) {
  if (tab === 'archived') {
    return chatId ? `/chat/archived/${chatId}` : '/chat/archived'
  }
  return chatId ? `/chat/${chatId}` : '/chat'
}

// Auth is already guaranteed by PrivateLayout wrapping this route — the
// ability check below is what actually gates *this* feature specifically
// (chat can be restricted to specific roles via the feature-flags admin
// matrix; hiding the nav link isn't enough on its own since every chat
// route is still directly reachable by URL).
export default function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: chatId = null } = useParams<{ id?: string }>()
  const tab: ChatTab = location.pathname.startsWith('/chat/archived') ? 'archived' : 'chats'
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
          navigate(chatHref(null, next))
        }}
        onChatIdChange={(id, options) => {
          navigate(chatHref(id, options?.tab ?? tab))
        }}
      />
    </div>
  )
}
