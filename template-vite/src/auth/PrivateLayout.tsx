'use client'

import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

import { AppShell } from '@/components/auth/app-shell'
import { clearAuthSession } from '@/components/auth/auth-session'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { useCurrentUser } from '@/components/auth/use-current-user'
import { toast } from '@/components/auth/notify'

const NAV_ITEMS_PLACEHOLDER: { label: string; href: string; requiredAbility?: string }[] = []

/**
 * Wraps every private route (see routes.tsx's PRIVATE_ROUTE_ENTRIES /
 * PRIVATE_NAV_ITEMS) — redirects to /login with no session, otherwise
 * renders the sidebar app shell around the matched child route via <Outlet/>.
 */
export default function PrivateLayout({
  navItems: allNavItems = NAV_ITEMS_PLACEHOLDER,
}: {
  navItems?: { label: string; href: string; requiredAbility?: string }[]
}) {
  const location = useLocation()
  const session = useAuthSession()
  const { abilities } = useCurrentUser()
  const navItems = allNavItems.filter((item) => !item.requiredAbility || abilities.includes(item.requiredAbility))

  if (!session) {
    return <Navigate to="/login" replace />
  }

  function logout() {
    clearAuthSession()
    toast.success('Signed out')
  }

  return (
    <AppShell
      navItems={navItems}
      activeHref={location.pathname}
      userEmail={session.user.email}
      onLogout={logout}
      renderLink={({ href, className, children }) => (
        <Link to={href} className={className}>
          {children}
        </Link>
      )}
    >
      <Outlet />
    </AppShell>
  )
}
