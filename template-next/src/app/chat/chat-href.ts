import type { ChatTab } from '@/components/chat/types'

/** Build chat URLs: `/chat`, `/chat/:id`, `/chat/archived`, `/chat/archived/:id`. */
export function chatHref(chatId: string | null, tab: ChatTab): string {
  if (tab === 'archived') {
    return chatId ? `/chat/archived/${chatId}` : '/chat/archived'
  }
  return chatId ? `/chat/${chatId}` : '/chat'
}
