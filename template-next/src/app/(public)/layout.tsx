'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import * as React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { useAuthSession } from '@/components/auth/use-auth-store'
import { Toaster } from '@/components/ui/sonner'

// Every `<GoogleSignInButton>` needs a `GoogleOAuthProvider` ancestor
// (@react-oauth/google reads the client ID from context, not a prop on the
// button itself) — set up once here rather than per-page, since every
// public auth page potentially wants the button. Empty string is a safe,
// inert default when the host app hasn't configured
// NEXT_PUBLIC_GOOGLE_CLIENT_ID yet — login/signup pages only render the
// button once this is actually set.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

// Wraps every public auth page (login, signup, forgot/reset-password,
// verify-otp, verify-reset-otp, accept-invitation) — a signed-in user
// landing here (stale bookmark, back button, ...) is bounced to /dashboard
// instead of being shown the logged-out flow again.
export default function PublicOnlyLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const session = useAuthSession()
  // Same hydration-safety pattern as (app)/layout.tsx's private-route guard —
  // useAuthSession()'s first client render reports `null` even when a real
  // session exists in localStorage; wait one tick past mount before treating
  // a present session as "actually signed in" and redirecting away.
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical "past hydration" gate, not a data sync
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && session) router.replace('/dashboard')
  }, [mounted, session, router])

  if (mounted && session) return null

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {children}
      <Toaster />
    </GoogleOAuthProvider>
  )
}
