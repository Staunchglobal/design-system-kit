'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
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
import { PRIVATE_NAV_ITEMS } from './_nav'

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
 * Wraps every private route under `(app)` (chat, account home, change
 * password, email change, ...) — redirects to /login with no session,
 * otherwise renders the sidebar app shell. `PRIVATE_NAV_ITEMS` is generated
 * (see `_nav.ts`) from whichever private-page slugs are actually installed.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const session = useAuthSession()
  const { abilities } = useCurrentUser()
  const navItems = PRIVATE_NAV_ITEMS.filter(
    (item) => !item.requiredAbility || abilities.includes(item.requiredAbility)
  ).map((item) => ({
    ...item,
    icon: NAV_ICONS[item.href],
  }))
  // useAuthSession()'s useSyncExternalStore reports `null` on the very first
  // client render (its getServerSnapshot, used to avoid a hydration
  // mismatch) even when a real session exists in localStorage — redirecting
  // on that first render would bounce an already-signed-in user back to
  // /login on every hard page load/refresh. Wait one extra tick past
  // mount before treating a null session as "actually signed out."
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical "past hydration" gate, not a data sync
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && !session) router.replace('/login')
  }, [mounted, session, router])

  if (!mounted || !session) return null

  function logout() {
    clearAuthSession()
    toast.success('Signed out')
    router.push('/login')
  }

  return (
    <>
      <AppShell
        navItems={navItems}
        activeHref={pathname}
        userEmail={session.user.email}
        onLogout={logout}
        renderLink={({ href, className, children: linkChildren }) => (
          <Link href={href} className={className}>
            {linkChildren}
          </Link>
        )}
      >
        {children}
      </AppShell>
      <Toaster />
    </>
  )
}
