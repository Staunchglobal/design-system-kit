'use client'

import { Navigate, Outlet } from 'react-router-dom'

import { useAuthSession } from '@/components/auth/use-auth-store'

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

  return <Outlet />
}
