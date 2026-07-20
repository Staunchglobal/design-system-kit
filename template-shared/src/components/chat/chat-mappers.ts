import type { ChatAttachment, ChatMessage, Conversation } from '@/components/chat/types'

/** Shape returned by `allChats` / `chatReordered` (verified in design-kit-api `src/schema.gql`). */
export type ApiChatRow = {
  id: string
  /** Whether the chat is active (not archived) — `chatReordered` is a global per-user
   *  subscription, not scoped to a tab, so this is the only reliable signal for which
   *  list a reordered chat actually belongs in. */
  isActive?: boolean | null
  updatedAt: string
  unreadCount: number
  lastMessage?: {
    content?: string | null
    createdAt?: string | null
    messageType?: string | null
    attachmentUrls?: string[] | null
  } | null
  otherParticipant?: {
    id: string
    fullName: string
    imageUrl?: string | null
    email?: string | null
  } | null
}

export type AllChatsResult = {
  allChats: {
    allData: ApiChatRow[]
    dataCount: number
    nextPage: number | null
    prevPage: number | null
    totalPages: number
  }
}

/** Shape shared by `fetchAllMessages`, `sendMessage`, and `messageAdded`. */
export type ApiMessageRow = {
  id: string
  content: string
  // Nullable: ChatMessageType.createdAt is String! but MessageAddedPayload.createdAt is
  // just String (schema-nullable) — honor the weaker of the two shapes this type covers.
  createdAt?: string | null
  messageType?: string | null
  attachmentUrls?: string[] | null
  /** List on queries; subscription may send a comma-joined string. */
  attachments?:
    | Array<{ id?: string; url: string; fileName?: string; mimeType?: string }>
    | string
    | null
  user?: {
    id: string
    fullName: string
    imageUrl?: string | null
    email?: string | null
  } | null
  sender?: {
    id: string
    fullName: string
    imageUrl?: string | null
    email?: string | null
  } | null
  chatId?: string | null
}

function toMessageType(value: string | null | undefined): ChatMessage['messageType'] {
  if (value === 'IMAGE' || value === 'FILE' || value === 'TEXT') return value
  return 'TEXT'
}

export function mapConversation(row: ApiChatRow): Conversation {
  return {
    id: row.id,
    name: row.otherParticipant?.fullName ?? 'Unknown',
    email: row.otherParticipant?.email,
    avatar: row.otherParticipant?.imageUrl,
    lastMessage: row.lastMessage?.content ?? '',
    lastMessageType: row.lastMessage?.messageType,
    lastAttachmentUrls: row.lastMessage?.attachmentUrls ?? [],
    timestamp: row.lastMessage?.createdAt ?? row.updatedAt,
    updatedAt: row.updatedAt,
    unreadCount: row.unreadCount ?? 0,
    // Default true (not archived) when the field is genuinely absent from a response
    // that never queried it — every call site that cares (chatReordered) always queries it.
    isActive: row.isActive ?? true,
  }
}

export function mapApiMessage(m: ApiMessageRow): ChatMessage {
  const sender = m.sender ?? m.user
  if (!sender) {
    throw new Error(`Message ${m.id} is missing sender/user`)
  }

  const fromAttachmentField = Array.isArray(m.attachments)
    ? m.attachments.map((a) => a.url)
    : typeof m.attachments === 'string' && m.attachments.length > 0
      ? m.attachments
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean)
      : []

  const rawUrls = [
    ...(Array.isArray(m.attachmentUrls) ? m.attachmentUrls : []),
    ...fromAttachmentField,
  ]
  const attachmentUrls = [...new Set(rawUrls.filter((u) => u && !u.startsWith('blob:')))]

  const attachments: ChatAttachment[] = (
    Array.isArray(m.attachments)
      ? m.attachments
      : attachmentUrls.map((url) => ({ url }))
  ).filter((a) => a?.url && !a.url.startsWith('blob:'))

  return {
    id: m.id,
    content: m.content,
    // MessageAddedPayload.createdAt is schema-nullable (unlike ChatMessageType's), even
    // though the live resolver always populates it today — fall back rather than ship a
    // literal "null" string if that ever changes.
    createdAt: m.createdAt ?? new Date().toISOString(),
    messageType: toMessageType(m.messageType),
    attachmentUrls,
    attachments,
    sender: {
      id: sender.id,
      fullName: sender.fullName,
      imageUrl: sender.imageUrl,
      email: sender.email,
    },
    chatId: m.chatId,
  }
}
