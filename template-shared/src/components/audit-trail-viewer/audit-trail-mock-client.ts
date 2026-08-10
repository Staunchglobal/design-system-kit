import type { AuditTrailEntry } from '@/components/audit-trail-viewer/types'

export const AUDIT_TRAIL_MOCK_ENDPOINT = 'mock://audit-trail-viewer'

const ENTRIES: AuditTrailEntry[] = [
  {
    id: '1',
    itemType: 'User',
    itemId: '1',
    event: 'update',
    whodunnit: '1',
    createdAt: new Date(Date.now() - 60_000).toISOString(),
    auditSummary: 'User #1 updated: email',
    meaningfulChanges: { email: ['old@example.com', 'admin@example.com'] },
  },
  {
    id: '2',
    itemType: 'User',
    itemId: '2',
    event: 'create',
    whodunnit: '1',
    createdAt: new Date(Date.now() - 300_000).toISOString(),
    auditSummary: 'User #2 created',
    meaningfulChanges: {},
  },
]

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function delay(ms = 200) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function auditTrailMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await delay()
  const name = opName(query)

  if (name !== 'AuditTrail') {
    throw new Error(`Unknown audit-trail-viewer operation: ${name || '(unnamed)'}`)
  }

  const itemType = variables.itemType as string | undefined
  const itemId = variables.itemId as string | undefined
  const page = Number(variables.page ?? 1)
  const perPage = Number(variables.perPage ?? 25)

  let scoped = ENTRIES
  if (itemType) scoped = scoped.filter((e) => e.itemType === itemType)
  if (itemId) scoped = scoped.filter((e) => e.itemId === itemId)

  const count = scoped.length
  const pages = count === 0 ? 0 : Math.ceil(count / perPage)
  const start = (page - 1) * perPage

  return {
    auditTrail: { entries: scoped.slice(start, start + perPage), pagination: { page, pages, count, perPage } },
  } as T
}
