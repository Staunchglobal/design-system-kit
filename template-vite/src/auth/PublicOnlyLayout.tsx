'use client'

import { Navigate, Outlet } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

import { useAuthSession } from '@/components/auth/use-auth-store'

// Every `<GoogleSignInButton>` needs a `GoogleOAuthProvider` ancestor
// (@react-oauth/google reads the client ID from context, not a prop on the
// button itself) — set up once here rather than per-page. Empty string is
// a safe, inert default when the host app hasn't configured
// VITE_GOOGLE_CLIENT_ID yet — login/signup pages only render the button
// once this is actually set.
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''

/**
 * Wraps every public auth route (see routes.tsx) — a signed-in user landing
 * here (stale bookmark, back button, ...) is bounced to /dashboard instead of
 * being shown the logged-out flow again. Mirror of PrivateLayout's redirect,
 * inverted.
 */
export default function PublicOnlyLayout() {
  const session = useAuthSession()

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Outlet />
    </GoogleOAuthProvider>
  )
}
