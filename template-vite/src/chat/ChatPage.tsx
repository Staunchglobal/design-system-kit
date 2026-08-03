'use client'

import * as React from 'react'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { ChatInbox } from '@/components/chat/chat-inbox'
import type { ChatTab } from '@/components/chat/types'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL as string | undefined

function chatHref(chatId: string | null, tab: ChatTab) {
  if (tab === 'archived') {
    return chatId ? `/chat/archived/${chatId}` : '/chat/archived'
  }
  return chatId ? `/chat/${chatId}` : '/chat'
}

function go(path: string) {
  window.location.assign(path)
}

/** Parse /chat/:id and /chat/archived/:id without requiring react-router-dom. */
function parseChatRoute(): { tab: ChatTab; chatId: string | null } {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const archived = parts[0] === 'chat' && parts[1] === 'archived'
  const tab: ChatTab = archived ? 'archived' : 'chats'
  const chatId = archived
    ? (parts[2] ?? null)
    : parts[0] === 'chat' && parts[1] && parts[1] !== 'archived'
      ? parts[1]
      : null
  return { tab, chatId }
}

export default function ChatPage() {
  const [{ tab, chatId }, setRoute] = React.useState(parseChatRoute)
  const session = useAuthSession()
  const authed = Boolean(session?.token)

  React.useEffect(() => {
    const onPopState = () => setRoute(parseChatRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <h1 className="text-xl font-semibold">Sign in to open chat</h1>
        <p className="text-muted-foreground text-sm">
          Use the auth demo pages, then return here.
        </p>
        <Button asChild>
          <a href="/auth/login">Go to login</a>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          I already signed in
        </Button>
        <Toaster />
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
          go(chatHref(null, next))
        }}
        onChatIdChange={(id, options) => {
          go(chatHref(id, options?.tab ?? tab))
        }}
      />
      <Toaster />
    </div>
  )
}
