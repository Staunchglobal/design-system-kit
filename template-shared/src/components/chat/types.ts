export type ChatUser = {
  id: string
  fullName: string
  email?: string | null
  imageUrl?: string | null
}

export type ChatAttachment = {
  id?: string
  url: string
  fileName?: string
  mimeType?: string
  sizeBytes?: number
}

export type ChatMessage = {
  id: string
  content: string
  createdAt: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE'
  attachmentUrls: string[]
  attachments: ChatAttachment[]
  sender: ChatUser
  chatId?: string | null
}

export type Conversation = {
  id: string
  name: string
  email?: string | null
  avatar?: string | null
  lastMessage: string
  lastMessageType?: string | null
  lastAttachmentUrls?: string[]
  timestamp: string
  updatedAt: string
  unreadCount: number
  isOnline?: boolean
  /** Whether the chat is currently active (not archived) — drives which tab it belongs in. */
  isActive: boolean
}

export type ChatTab = 'chats' | 'archived'

export type ChatFetch = <T>(
  query: string,
  variables?: Record<string, unknown>
) => Promise<T>

export type ChatUpload = (files: File[]) => Promise<string[]>

export type Unsubscribe = () => void
