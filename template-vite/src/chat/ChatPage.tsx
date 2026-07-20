'use client'

import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import * as React from 'react'
import { getAuthSession } from '@/components/auth/auth-session'
import { ChatInbox } from '@/components/chat/chat-inbox'
import type { ChatTab } from '@/components/chat/types'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined
const GRAPHQL_WS_URL = import.meta.env.VITE_GRAPHQL_WS_URL as string | undefined
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL as string | undefined

function chatHref(chatId: string | null, tab: ChatTab) {
  if (tab === 'archived') {
    return chatId ? `/chat/archived/${chatId}` : '/chat/archived'
  }
  return chatId ? `/chat/${chatId}` : '/chat'
}

export default function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams<{ id?: string }>()
  const tab: ChatTab = location.pathname.startsWith('/chat/archived')
    ? 'archived'
    : 'chats'
  const chatId = typeof params.id === 'string' ? params.id : null
  const [ready, setReady] = React.useState(false)
  const [authed, setAuthed] = React.useState(false)

  React.useEffect(() => {
    const session = getAuthSession()
    setAuthed(Boolean(session?.token))
    setReady(true)
  }, [])

  if (!ready) {
    return <div className="text-muted-foreground p-8 text-sm">Loading…</div>
  }

  if (!authed) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
        <h1 className="text-xl font-semibold">Sign in to open chat</h1>
        <p className="text-muted-foreground text-sm">
          Use the auth demo pages, then return here.
        </p>
        <Button asChild>
          <Link to="/auth/login">Go to login</Link>
        </Button>
        <Button variant="outline" onClick={() => navigate(0)}>
          I already signed in
        </Button>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <ChatInbox
        graphqlUrl={GRAPHQL_URL}
        graphqlWsUrl={GRAPHQL_WS_URL}
        uploadUrl={UPLOAD_URL}
        chatId={chatId}
        tab={tab}
        onTabChange={(next) => {
          void navigate(chatHref(null, next))
        }}
        onChatIdChange={(id, options) => {
          void navigate(chatHref(id, options?.tab ?? tab))
        }}
      />
      <Toaster />
    </div>
  )
}
