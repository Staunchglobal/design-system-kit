'use client'

import { useParams } from 'next/navigation'
import { ChatApp } from '../../chat-app'

/** Archived conversation at `/chat/archived/:id`. */
export default function ChatArchivedThreadPage() {
  const params = useParams<{ id: string }>()
  const chatId = typeof params.id === 'string' ? params.id : null
  return <ChatApp chatId={chatId} tab="archived" />
}
