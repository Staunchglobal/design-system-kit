'use client'

import { ChatApp } from '../chat-app'

/** Archived inbox at `/chat/archived`. */
export default function ChatArchivedIndexPage() {
  return <ChatApp chatId={null} tab="archived" />
}
