import type { DeliveryLogEntry, Pagination } from '@/components/delivery-logs/types'

// Read-only query — no mutations here (the one write path, Twilio's status
// webhook, is server-to-server and never called from the frontend).
// `entries` is a GraphQL union (EmailLog/TextMessage), hence the two `... on`
// fragment spreads plus `__typename` to discriminate them client-side.
export const DELIVERY_LOGS = `
  query DeliveryLogs($channel: String, $page: Int, $perPage: Int) {
    deliveryLogs(channel: $channel, page: $page, perPage: $perPage) {
      entries {
        __typename
        ... on EmailLog {
          id
          mailerClass
          mailerAction
          to
          subject
          status
          messageId
          errorMessage
          sentAt
          createdAt
        }
        ... on TextMessage {
          id
          to
          body
          status
          providerSid
          errorMessage
          sentAt
          deliveredAt
          createdAt
        }
      }
      pagination { page pages count perPage }
    }
  }
`

export type DeliveryLogsResult = {
  deliveryLogs: { entries: DeliveryLogEntry[]; pagination: Pagination }
}
