'use client'

import { useParams } from 'next/navigation'
import { ChatApp } from '../chat-app'

/** Active conversation at `/chat/:id`. */
export default function ChatThreadPage() {
  const params = useParams<{ id: string }>()
  const chatId = typeof params.id === 'string' ? params.id : null
  return <ChatApp chatId={chatId} tab="chats" />
}
