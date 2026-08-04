import type { DeliveryLogEntry } from '@/components/delivery-logs/types'

export const DELIVERY_LOGS_MOCK_ENDPOINT = 'mock://delivery-logs'

const ENTRIES: DeliveryLogEntry[] = [
  {
    __typename: 'EmailLog',
    id: '1',
    mailerClass: 'AuthMailer',
    mailerAction: 'otp_code',
    to: 'demo@example.com',
    subject: 'Your sign-in code',
    status: 'sent',
    messageId: 'msg_demo_1',
    errorMessage: null,
    sentAt: new Date(Date.now() - 60_000).toISOString(),
    createdAt: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    __typename: 'TextMessage',
    id: '2',
    to: '+15550001111',
    body: 'Your verification code is 123456',
    status: 'delivered',
    providerSid: 'SM_demo_1',
    errorMessage: null,
    sentAt: new Date(Date.now() - 120_000).toISOString(),
    deliveredAt: new Date(Date.now() - 115_000).toISOString(),
    createdAt: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    __typename: 'EmailLog',
    id: '3',
    mailerClass: 'UserManagementMailer',
    mailerAction: 'invitation',
    to: 'teammate@example.com',
    subject: "You're invited",
    status: 'failed',
    messageId: null,
    errorMessage: 'Mailbox not found',
    sentAt: null,
    createdAt: new Date(Date.now() - 300_000).toISOString(),
  },
]

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function deliveryLogsMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await delay()
  const name = opName(query)

  if (name !== 'DeliveryLogs') {
    throw new Error(`Unknown delivery-logs operation: ${name || '(unnamed)'}`)
  }

  const channel = variables.channel as string | undefined
  const page = Number(variables.page ?? 1)
  const perPage = Number(variables.perPage ?? 25)

  let scoped = ENTRIES
  if (channel === 'email') scoped = ENTRIES.filter((e) => e.__typename === 'EmailLog')
  if (channel === 'sms') scoped = ENTRIES.filter((e) => e.__typename === 'TextMessage')

  const count = scoped.length
  const pages = count === 0 ? 0 : Math.ceil(count / perPage)
  const start = (page - 1) * perPage

  return {
    deliveryLogs: { entries: scoped.slice(start, start + perPage), pagination: { page, pages, count, perPage } },
  } as T
}
