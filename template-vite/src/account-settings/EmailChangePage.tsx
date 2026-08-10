'use client'

import { useNavigate } from 'react-router-dom'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { EmailChangeSettings } from '@/components/account-settings/email-change-settings'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export default function EmailChangePage() {
  const navigate = useNavigate()
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('account_settings:access')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return <EmailChangeSettings endpoint={GRAPHQL_URL} onUnauthenticated={() => navigate('/login')} />
}
