export type EmailLogEntry = {
  __typename: 'EmailLog'
  id: string
  mailerClass: string
  mailerAction: string
  to: string
  subject: string
  status: string
  messageId: string | null
  errorMessage: string | null
  sentAt: string | null
  createdAt: string
}

export type TextMessageEntry = {
  __typename: 'TextMessage'
  id: string
  to: string
  body: string
  status: string
  providerSid: string | null
  errorMessage: string | null
  sentAt: string | null
  deliveredAt: string | null
  createdAt: string
}

export type DeliveryLogEntry = EmailLogEntry | TextMessageEntry

export type Pagination = {
  page: number
  pages: number
  count: number
  perPage: number
}

export type DeliveryLogsFetch = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>
