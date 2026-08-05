'use client'

import { useNavigate } from 'react-router-dom'

import { EmailChangeSettings } from '@/components/account-settings/email-change-settings'
import { Toaster } from '@/components/ui/sonner'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined

export default function EmailChangePage() {
  const navigate = useNavigate()
  return (
    <>
      <EmailChangeSettings endpoint={GRAPHQL_URL} onUnauthenticated={() => navigate('/login')} />
      <Toaster />
    </>
  )
}
