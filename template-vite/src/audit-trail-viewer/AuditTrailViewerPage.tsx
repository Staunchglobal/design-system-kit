'use client'

import * as React from 'react'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { AuditTrailScreen } from '@/components/audit-trail-viewer/audit-trail-screen'
import { createAuditTrailFetch } from '@/components/audit-trail-viewer/audit-trail-fetch'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export default function AuditTrailViewerPage() {
  const fetch = React.useMemo(() => createAuditTrailFetch({ endpoint: GRAPHQL_URL }), [])
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('audit_trail:view')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return <AuditTrailScreen fetch={fetch} />
}
