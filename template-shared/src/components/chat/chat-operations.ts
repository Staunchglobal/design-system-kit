// allChats/availableUsersForChat/fetchAllMessages are GraphQL resolvers, not
// RelayClassicMutation mutations — their arguments are flat, top-level query
// arguments, not wrapped in a single `$input` variable the way every mutation
// below is.

export const ALL_CHATS = `
  query AllChats($page: Int, $perPage: Int, $search: String, $archived: Boolean) {
    allChats(page: $page, perPage: $perPage, search: $search, archived: $archived) {
      chats {
        id
        isActive
        updatedAt
        unreadCount
        lastMessage {
          id
          content
          createdAt
          messageType
          attachmentUrls
        }
        otherParticipant {
          id
          fullName
          imageUrl
          email
        }
      }
      pagination {
        page
        pages
        count
        perPage
      }
    }
  }
`

export const AVAILABLE_USERS_FOR_CHAT = `
  query AvailableUsersForChat($search: String, $page: Int, $perPage: Int) {
    availableUsersForChat(search: $search, page: $page, perPage: $perPage) {
      users {
        id
        fullName
        email
        imageUrl
      }
      pagination {
        page
        pages
        count
        perPage
      }
    }
  }
`

export const FETCH_ALL_MESSAGES = `
  query FetchAllMessages($chatId: ID!, $page: Int, $perPage: Int) {
    fetchAllMessages(chatId: $chatId, page: $page, perPage: $perPage) {
      messages {
        id
        content
        createdAt
        messageType
        attachmentUrls
        attachments {
          id
          url
          fileName
          mimeType
          sizeBytes
        }
        sender {
          id
          fullName
          imageUrl
          email
        }
        chatId
      }
      pagination {
        page
        pages
        count
        perPage
      }
    }
  }
`

export const CREATE_CHAT = `
  mutation CreateChat($participantIds: [ID!]!) {
    createChat(input: { participantIds: $participantIds }) {
      chat {
        id
        updatedAt
        unreadCount
        otherParticipant {
          id
          fullName
          imageUrl
          email
        }
      }
    }
  }
`

export const ARCHIVE_CHAT = `
  mutation ArchiveChat($chatId: ID!, $archive: Boolean) {
    archiveChat(input: { chatId: $chatId, archive: $archive }) {
      success
    }
  }
`

export const MARK_CHAT_AS_READ = `
  mutation MarkChatAsRead($chatId: ID!) {
    markChatAsRead(input: { chatId: $chatId }) {
      success
    }
  }
`

// Attachments only ever arrive as a real multipart `files: [Upload!]` upload
// — the backend has no argument for a client-supplied attachment URL.
export const SEND_MESSAGE = `
  mutation SendMessage(
    $chatId: ID!
    $content: String!
    $messageType: MessageType!
    $files: [Upload!]
  ) {
    sendMessage(
      input: {
        chatId: $chatId
        content: $content
        messageType: $messageType
        files: $files
      }
    ) {
      message {
        id
        content
        createdAt
        messageType
        attachmentUrls
        chatId
        sender {
          id
          fullName
          imageUrl
        }
      }
    }
  }
`

export const MESSAGE_ADDED = `
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      id
      content
      messageType
      createdAt
      chatId
      attachmentUrls
      attachments {
        id
        url
        fileName
        mimeType
        sizeBytes
      }
      sender {
        id
        fullName
        imageUrl
        email
      }
    }
  }
`

export const CHAT_REORDERED = `
  subscription ChatReordered($userId: ID!) {
    chatReordered(userId: $userId) {
      id
      isActive
      updatedAt
      unreadCount
      lastMessage {
        id
        content
        createdAt
        messageType
        attachmentUrls
      }
      otherParticipant {
        id
        fullName
        imageUrl
        email
      }
    }
  }
`

export const UNREAD_COUNT_UPDATED = `
  subscription UnreadChatCountUpdated($userId: ID!) {
    unreadChatCountUpdated(userId: $userId) {
      unreadChatCount
    }
  }
`

export type MessageTypeEnum = 'TEXT' | 'IMAGE' | 'VIDEO' | 'ANNOUNCEMENT'
