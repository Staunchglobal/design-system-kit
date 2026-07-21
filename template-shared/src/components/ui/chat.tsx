/**
 * Opt-in chat feature entry — filesystem discovery picks up slug `chat`.
 * Prefer importing from `@/components/chat/*` directly.
 */
export { ChatInbox } from '@/components/chat/chat-inbox'
export { ChatShell } from '@/components/chat/chat-shell'
export { createChatFetch, CHAT_MOCK_ENDPOINT } from '@/components/chat/chat-fetch'
export { graphqlUploadFetch } from '@/components/chat/chat-graphql-upload'
export { compressImages, compressImageIfNeeded } from '@/components/chat/image-compression'
export { createChatSubscriptions } from '@/components/chat/chat-subscribe'
/** Ensures sonner / message primitives land in chat uiDeps via demo usage. */
export { Toaster } from '@/components/ui/sonner'
export { Message } from '@/components/ui/message'
export { Bubble } from '@/components/ui/bubble'
