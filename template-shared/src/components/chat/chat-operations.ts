export const ALL_CHATS = `
  query AllChats($page: Int, $perPage: Int, $search: String, $archived: Boolean) {
    allChats(page: $page, perPage: $perPage, search: $search, archived: $archived) {
      allData {
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
      dataCount
      nextPage
      prevPage
      totalPages
    }
  }
`

export const AVAILABLE_USERS_FOR_CHAT = `
  query AvailableUsersForChat($search: String, $page: Int, $perPage: Int) {
    availableUsersForChat(search: $search, page: $page, perPage: $perPage) {
      allData {
        id
        fullName
        email
        imageUrl
      }
      count
      nextPage
      totalPages
    }
  }
`

export const FETCH_ALL_MESSAGES = `
  query FetchAllMessages($chatId: ID!, $page: Int, $perPage: Int) {
    fetchAllMessages(chatId: $chatId, page: $page, perPage: $perPage) {
      allData {
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
        user {
          id
          fullName
          imageUrl
          email
        }
        chatId
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`

export const CREATE_CHAT = `
  mutation CreateChat($participantId: ID!) {
    createChat(input: { participantId: $participantId }) {
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

export const SEND_MESSAGE = `
  mutation SendMessage(
    $chatId: ID!
    $content: String!
    $messageType: MessageTypeEnum!
    $attachmentUrls: [String!]
    $files: [Upload!]
  ) {
    sendMessage(
      input: {
        chatId: $chatId
        content: $content
        messageType: $messageType
        attachmentUrls: $attachmentUrls
        files: $files
      }
    ) {
      success
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
        user {
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
      attachments
      attachmentUrls
      updatedAt
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

export type MessageTypeEnum = 'TEXT' | 'IMAGE' | 'FILE'
