'use client'

import { EmailChangeSettings } from '@/components/account-settings/email-change-settings'
import { Toaster } from '@/components/ui/sonner'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

function go(path: string) {
  window.location.assign(path)
}

export default function EmailChangePage() {
  return (
    <>
      <EmailChangeSettings endpoint={GRAPHQL_URL} onUnauthenticated={() => go('/auth/login')} />
      <Toaster />
    </>
  )
}
