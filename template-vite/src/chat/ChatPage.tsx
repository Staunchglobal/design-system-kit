'use client'

import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChatInbox } from '@/components/chat/chat-inbox'
import type { ChatTab } from '@/components/chat/types'
import { Toaster } from '@/components/ui/sonner'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL as string | undefined

function chatHref(chatId: string | null, tab: ChatTab) {
  if (tab === 'archived') {
    return chatId ? `/chat/archived/${chatId}` : '/chat/archived'
  }
  return chatId ? `/chat/${chatId}` : '/chat'
}

// Auth is already guaranteed by PrivateLayout wrapping this route.
export default function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id: chatId = null } = useParams<{ id?: string }>()
  const tab: ChatTab = location.pathname.startsWith('/chat/archived') ? 'archived' : 'chats'

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
      <Toaster />
    </div>
  )
}
