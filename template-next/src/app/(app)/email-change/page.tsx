'use client'

import { useRouter } from 'next/navigation'

import { EmailChangeSettings } from '@/components/account-settings/email-change-settings'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

export default function EmailChangePage() {
  const router = useRouter()

  return (
    <EmailChangeSettings
      endpoint={GRAPHQL_URL}
      onUnauthenticated={() => router.replace('/login')}
    />
  )
}
