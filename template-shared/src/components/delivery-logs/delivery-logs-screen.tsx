'use client'

import * as React from 'react'
import { MailIcon, MessageSquareIcon } from 'lucide-react'

import { CrudScreen } from '@/components/crud/crud-screen'
import type { CrudColumn, CrudPageParams, CrudTab } from '@/components/crud/types'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import type { DeliveryLogEntry, DeliveryLogsFetch } from '@/components/delivery-logs/types'
import { DELIVERY_LOGS, type DeliveryLogsResult } from '@/components/delivery-logs/delivery-logs-operations'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  sent: 'success',
  delivered: 'success',
  pending: 'warning',
  scheduled: 'warning',
  failed: 'destructive',
  undelivered: 'destructive',
}

function statusBadge(status: string) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'secondary'} className="capitalize">
      {status}
    </Badge>
  )
}

const COLUMNS: CrudColumn<DeliveryLogEntry>[] = [
  {
    key: 'channel',
    header: 'Channel',
    render: (row) =>
      row.__typename === 'EmailLog' ? (
        <span className="flex items-center gap-1.5 text-sm">
          <MailIcon className="text-muted-foreground size-4" /> Email
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm">
          <MessageSquareIcon className="text-muted-foreground size-4" /> SMS
        </span>
      ),
  },
  { key: 'to', header: 'To', className: 'font-medium' },
  {
    key: 'content',
    header: 'Content',
    render: (row) => (
      <span className="text-muted-foreground line-clamp-1">
        {row.__typename === 'EmailLog' ? row.subject : row.body}
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: (row) => statusBadge(row.status) },
  {
    key: 'sentAt',
    header: 'Sent',
    sortable: true,
    render: (row) => (row.sentAt ? new Date(row.sentAt).toLocaleString() : '—'),
  },
]

const TABS: CrudTab[] = [
  { label: 'All', value: 'all' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
]

export type DeliveryLogsScreenProps = {
  fetch: DeliveryLogsFetch
}

export function DeliveryLogsScreen({ fetch }: DeliveryLogsScreenProps) {
  const fetchPage = React.useCallback(
    async ({ page, pageSize, tab }: CrudPageParams) => {
      const channel = tab && tab !== 'all' ? tab : undefined
      const data = await fetch<DeliveryLogsResult>(DELIVERY_LOGS, { channel, page, perPage: pageSize })
      return { items: data.deliveryLogs.entries, totalCount: data.deliveryLogs.pagination.count }
    },
    [fetch]
  )

  return (
    <div className="flex w-full flex-col p-4 sm:p-6">
      <Toaster />
      <CrudScreen<DeliveryLogEntry>
        title="Delivery logs"
        description="Email and SMS delivery history, newest first."
        entityLabel="delivery log"
        columns={COLUMNS}
        fetchPage={fetchPage}
        getRowId={(row) => row.id}
        search={false}
        tabs={TABS}
        initialTab="all"
        withToaster={false}
        empty={{
          title: 'No delivery logs yet',
          description: 'Emails and texts sent by the app will show up here.',
        }}
      />
    </div>
  )
}
