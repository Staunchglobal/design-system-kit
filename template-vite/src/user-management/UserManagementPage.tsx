'use client'

import { useNavigate, useParams } from 'react-router-dom'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { UserManagementScreen } from '@/components/user-management/user-management-screen'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export default function UserManagementPage() {
  const navigate = useNavigate()
  const { tab } = useParams<{ tab: string }>()
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
      tab={tab ?? 'all'}
      onTabChange={(next) => navigate(`/user-management/${next}`)}
      onImpersonated={() => navigate('/chat')}
    />
  )
}
