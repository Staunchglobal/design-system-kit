'use client'

import * as React from 'react'

import { CrudScreen } from '@/components/crud/crud-screen'
import type { CrudColumn, CrudPageParams } from '@/components/crud/types'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InfoList, InfoRow } from '@/components/ui/info-row'
import type { AuditTrailEntry, AuditTrailFetch } from '@/components/audit-trail-viewer/types'
import { AUDIT_TRAIL, type AuditTrailResult } from '@/components/audit-trail-viewer/audit-trail-operations'

const EVENT_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  create: 'success',
  update: 'warning',
  destroy: 'destructive',
}

const COLUMNS: CrudColumn<AuditTrailEntry>[] = [
  {
    key: 'item',
    header: 'Record',
    render: (row) => (
      <span className="font-medium">
        {row.itemType} #{row.itemId}
      </span>
    ),
  },
  {
    key: 'event',
    header: 'Event',
    render: (row) => (
      <Badge variant={EVENT_VARIANT[row.event] ?? 'secondary'} className="capitalize">
        {row.event}
      </Badge>
    ),
  },
  { key: 'auditSummary', header: 'Summary', mobileLabel: 'Summary' },
  { key: 'whodunnit', header: 'By', render: (row) => row.whodunnit ?? '—' },
  {
    key: 'createdAt',
    header: 'When',
    sortable: true,
    render: (row) => new Date(row.createdAt).toLocaleString(),
  },
]

export type AuditTrailScreenProps = {
  fetch: AuditTrailFetch
  /** Scope to one record's history, e.g. from a "View history" button on that record's own admin screen. */
  itemType?: string
  itemId?: string
}

export function AuditTrailScreen({ fetch, itemType, itemId }: AuditTrailScreenProps) {
  const [detail, setDetail] = React.useState<AuditTrailEntry | null>(null)

  const fetchPage = React.useCallback(
    async ({ page, pageSize }: CrudPageParams) => {
      const data = await fetch<AuditTrailResult>(AUDIT_TRAIL, { itemType, itemId, page, perPage: pageSize })
      return { items: data.auditTrail.entries, totalCount: data.auditTrail.pagination.count }
    },
    [fetch, itemType, itemId]
  )

  const changeEntries = detail ? Object.entries(detail.meaningfulChanges) : []

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <Toaster />
      <div>
        <h2 className="text-lg font-semibold">Audit trail</h2>
        <p className="text-muted-foreground text-sm">Every tracked change across the app, newest first.</p>
      </div>
      <CrudScreen<AuditTrailEntry>
        entityLabel="change"
        columns={COLUMNS}
        fetchPage={fetchPage}
        getRowId={(row) => row.id}
        search={false}
        withToaster={false}
        empty={{ title: 'No audit history yet', description: 'Changes to tracked models will show up here.' }}
        actions={[{ key: 'details', label: 'Details', variant: 'outline', onClick: (row) => setDetail(row) }]}
      />

      <Dialog open={detail != null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.auditSummary}</DialogTitle>
            <DialogDescription>
              {detail?.itemType} #{detail?.itemId} · {detail ? new Date(detail.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>
          {changeEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">No field-level changes to show for this event.</p>
          ) : (
            <InfoList>
              {changeEntries.map(([field, [from, to]]) => (
                <InfoRow
                  key={field}
                  label={field}
                  value={`${from == null ? '—' : String(from)} → ${to == null ? '—' : String(to)}`}
                />
              ))}
            </InfoList>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
