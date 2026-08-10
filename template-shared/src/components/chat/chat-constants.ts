export const CHATS_PER_PAGE = 14
export const MESSAGES_PER_PAGE = 10
/** Debounce delay for chat/user search inputs (use-chat-inbox.ts). */
export const SEARCH_DEBOUNCE_MS = 300
/** How many files can be attached to one outbound message. */
export const MAX_ATTACHMENTS = 10
/** How many image tiles the bubble shows before collapsing the rest into +N. */
export const MAX_VISIBLE_IMAGES = 4
export const MAX_FILE_SIZE = 15 * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'] as const

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const ACCEPTED_ATTACHMENT_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
] as const

/** `accept` attribute — includes extensions for browsers that omit DOC MIME types. */
export const ATTACHMENT_ACCEPT = [
  ...ACCEPTED_ATTACHMENT_TYPES,
  '.pdf',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
].join(',')

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg'])
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx'])
const ACCEPTED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS])

function fileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

export function isImageAttachment(file: { type?: string; name?: string; fileName?: string }): boolean {
  if (file.type?.startsWith('image/')) return true
  const name = file.name ?? file.fileName ?? ''
  return IMAGE_EXTENSIONS.has(fileExtension(name))
}

export function isDocumentAttachment(file: {
  type?: string
  name?: string
  fileName?: string
  mimeType?: string
}): boolean {
  const mime = file.type ?? file.mimeType ?? ''
  if ((ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(mime)) return true
  const name = file.name ?? file.fileName ?? ''
  return DOCUMENT_EXTENSIONS.has(fileExtension(name))
}

export function isAcceptedAttachment(file: File): boolean {
  if ((ACCEPTED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) return true
  return ACCEPTED_EXTENSIONS.has(fileExtension(file.name))
}

