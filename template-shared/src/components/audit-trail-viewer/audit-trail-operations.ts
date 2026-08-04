import type { AuditTrailEntry, Pagination } from '@/components/audit-trail-viewer/types'

// Read-only — audit trail has no mutations, only whatever your own app's
// models write via has_audit_trail as a side effect of other changes.
export const AUDIT_TRAIL = `
  query AuditTrail($itemType: String, $itemId: ID, $page: Int, $perPage: Int) {
    auditTrail(itemType: $itemType, itemId: $itemId, page: $page, perPage: $perPage) {
      entries {
        id
        itemType
        itemId
        event
        whodunnit
        createdAt
        auditSummary
        meaningfulChanges
      }
      pagination { page pages count perPage }
    }
  }
`

export type AuditTrailResult = {
  auditTrail: { entries: AuditTrailEntry[]; pagination: Pagination }
}
