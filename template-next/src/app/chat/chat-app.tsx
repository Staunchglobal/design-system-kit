'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { getAuthSession } from '@/components/auth/auth-session'
import { ChatInbox } from '@/components/chat/chat-inbox'
import { chatHref } from '@/app/chat/chat-href'
import type { ChatTab } from '@/components/chat/types'
import { Button } from '@/components/ui/button'

// Static property access so Next.js can inline NEXT_PUBLIC_* at build time.
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL
const UPLOAD_URL = process.env.NEXT_PUBLIC_UPLOAD_URL


export function ChatApp({
  chatId,
  tab,
}: {
  chatId: string | null
  tab: ChatTab
}) {
  const router = useRouter()
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
          Use the auth demo pages, then return here. Mock mode works with the demo session after OTP.
        </p>
        <Button asChild>
          <Link href="/auth/login">Go to login</Link>
        </Button>
        <Button variant="outline" onClick={() => router.refresh()}>
          I already signed in
        </Button>
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
          router.push(chatHref(null, next))
        }}
        onChatIdChange={(id, options) => {
          router.push(chatHref(id, options?.tab ?? tab))
        }}
      />
    </div>
  )
}

export { chatHref } from '@/app/chat/chat-href'
