export type AuditTrailEntry = {
  id: string
  itemType: string
  itemId: string
  event: string
  whodunnit: string | null
  createdAt: string
  auditSummary: string
  /** PaperTrail's own changeset shape: `{ attr: [oldValue, newValue] }` (create/destroy events have none). */
  meaningfulChanges: Record<string, [unknown, unknown]>
}

export type Pagination = {
  page: number
  pages: number
  count: number
  perPage: number
}

export type AuditTrailFetch = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>
