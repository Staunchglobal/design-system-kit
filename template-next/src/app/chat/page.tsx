'use client'

import { ChatApp } from './chat-app'

/** Active inbox at `/chat`. */
export default function ChatIndexPage() {
  return <ChatApp chatId={null} tab="chats" />
}
