'use client'

import { useParams, useRouter } from 'next/navigation'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { UserManagementScreen } from '@/components/user-management/user-management-screen'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

export default function UserManagementPage() {
  const router = useRouter()
  const params = useParams<{ tab: string }>()
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

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
      tab={params.tab}
      onTabChange={(next) => router.push(`/user-management/${next}`)}
      onImpersonated={() => router.push('/chat')}
    />
  )
}
