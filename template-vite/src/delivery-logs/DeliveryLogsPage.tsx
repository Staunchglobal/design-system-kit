'use client'

import * as React from 'react'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { DeliveryLogsScreen } from '@/components/delivery-logs/delivery-logs-screen'
import { createDeliveryLogsFetch } from '@/components/delivery-logs/delivery-logs-fetch'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export default function DeliveryLogsPage() {
  const fetch = React.useMemo(() => createDeliveryLogsFetch({ endpoint: GRAPHQL_URL }), [])
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('delivery_logs:view')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return <DeliveryLogsScreen fetch={fetch} />
}
