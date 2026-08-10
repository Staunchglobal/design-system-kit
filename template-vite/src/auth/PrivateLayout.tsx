'use client'

import * as React from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  Flag,
  History,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react'

import { AppShell } from '@/components/auth/app-shell'
import { clearAuthSession } from '@/components/auth/auth-session'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { useCurrentUser } from '@/components/auth/use-current-user'
import { toast } from '@/components/auth/notify'
import { Toaster } from '@/components/ui/sonner'

const NAV_ITEMS_PLACEHOLDER: { label: string; href: string; requiredAbility?: string }[] = []

const NAV_ICONS: Record<string, React.ReactNode> = {
  '/user-management': <Users />,
  '/feature-flags-admin': <Flag />,
  '/delivery-logs': <Mail />,
  '/chat': <MessageSquare />,
  '/dashboard': <LayoutDashboard />,
  '/audit-trail-viewer': <History />,
  '/email-change': <Settings />,
}

/**
 * Wraps every private route (see routes.tsx's PRIVATE_ROUTE_ENTRIES /
 * PRIVATE_NAV_ITEMS) — redirects to /login with no session, otherwise
 * renders the sidebar app shell around the matched child route via <Outlet/>.
 */
export default function PrivateLayout({
  navItems: allNavItems = NAV_ITEMS_PLACEHOLDER,
  graphqlUrl,
}: {
  navItems?: { label: string; href: string; requiredAbility?: string }[]
  // Vite has no `process` global in the browser (unlike Next, which
  // inlines NEXT_PUBLIC_* into `process.env` at build time) — without
  // this, useCurrentUser() falls back to the mock client, `abilities` is
  // always `[]`, and every requiredAbility-gated nav item disappears for
  // everyone regardless of real role. Pass `import.meta.env.VITE_GRAPHQL_URL`.
  graphqlUrl?: string
}) {
  const location = useLocation()
  const session = useAuthSession()
  const { abilities } = useCurrentUser(graphqlUrl)
  const navItems = allNavItems
    .filter((item) => !item.requiredAbility || abilities.includes(item.requiredAbility))
    .map((item) => ({
      ...item,
      icon: NAV_ICONS[item.href],
    }))

  if (!session) {
    return <Navigate to="/login" replace />
  }

  function logout() {
    clearAuthSession()
    toast.success('Signed out')
  }

  return (
    <>
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
      {/* One Toaster for every private page, matching (app)/layout.tsx on
          Next — without it, pages that report errors solely via `toast`
          (FeatureFlagMatrix, useCurrentUser's permission-load failure)
          have nowhere to render them on Vite. */}
      <Toaster />
    </>
  )
}
