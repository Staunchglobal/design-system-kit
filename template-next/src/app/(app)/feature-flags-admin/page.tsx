'use client'

import * as React from 'react'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { FeatureFlagMatrix } from '@/components/feature-flags-admin/feature-flag-matrix'
import { createFeatureFlagsFetch } from '@/components/feature-flags-admin/feature-flags-admin-fetch'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

export default function FeatureFlagsAdminPage() {
  const fetch = React.useMemo(() => createFeatureFlagsFetch({ endpoint: GRAPHQL_URL }), [])
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('feature_flags:manage')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">Feature flags</h2>
        <p className="text-muted-foreground text-sm">
          Role × feature matrix. An untouched cell defaults to off (fail-closed).
        </p>
      </div>
      <FeatureFlagMatrix fetch={fetch} />
    </div>
  )
}
