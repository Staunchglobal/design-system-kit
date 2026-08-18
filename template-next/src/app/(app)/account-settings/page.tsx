'use client'

import { useRouter } from 'next/navigation'

import { useCurrentUser } from '@/components/auth/use-current-user'
import { AccountSettingsScreen } from '@/components/account-settings/account-settings-screen'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

export default function AccountSettingsPage() {
  const router = useRouter()
  const { can, loading } = useCurrentUser(GRAPHQL_URL)

  if (loading) return null
  if (!can('account_settings:access')) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
        <p className="text-muted-foreground text-sm">You don&apos;t have access to this page.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col p-4 sm:p-6">
      <AccountSettingsScreen endpoint={GRAPHQL_URL} onUnauthenticated={() => router.replace('/login')} />
    </div>
  )
}
