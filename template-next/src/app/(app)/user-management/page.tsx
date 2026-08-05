'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { UserManagementScreen } from '@/components/user-management/user-management-screen'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

const VALID_TABS = new Set(['all', 'active', 'archived', 'pending'])

function normalizeTab(value: string | null | undefined): string {
  return value && VALID_TABS.has(value) ? value : 'all'
}

function readTabFromLocation(): string {
  if (typeof window === 'undefined') return 'all'
  return normalizeTab(new URLSearchParams(window.location.search).get('tab'))
}

function writeTabToLocation(tab: string) {
  const url = tab === 'all' ? '/user-management' : `/user-management?tab=${tab}`
  // Avoid Next's router/searchParams — those re-suspend the page and remount
  // the screen (table flash) on every tab click.
  window.history.replaceState(window.history.state, '', url)
}

/**
 * Tabs are React state. The URL is mirrored with history.replaceState so
 * refreshes/bookmarks still work, without a Next navigation that remounts
 * the client tree.
 */
export default function UserManagementPage() {
  const router = useRouter()
  const { can, loading } = useCurrentUser(GRAPHQL_URL)
  const [tab, setTab] = React.useState(readTabFromLocation)

  React.useEffect(() => {
    const onPopState = () => setTab(readTabFromLocation())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (loading) return null
  if (!can('users:view')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return (
    <UserManagementScreen
      graphqlUrl={GRAPHQL_URL}
      tab={tab}
      onTabChange={(next) => {
        const normalized = normalizeTab(next)
        if (normalized === tab) return
        setTab(normalized)
        writeTabToLocation(normalized)
      }}
      onImpersonated={() => router.push('/chat')}
    />
  )
}
