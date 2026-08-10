'use client'

import Link from 'next/link'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/components/auth/use-auth-store'

// Auth is already guaranteed by the (app)/layout.tsx wrapping this route —
// no session check needed here; sign-out lives in the app shell's sidebar.
export default function DashboardPage() {
  const session = useAuthSession()
  if (!session) return null

  return (
    <AuthShell title="Account" description={session.user.email}>
      <div className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <Link href="/chat">Chat</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/change-password">Change password</Link>
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          Session is stored in localStorage (demo stub). Swap{' '}
          <code className="text-foreground">createAuthFetch</code> endpoint for a real API.
        </p>
      </div>
    </AuthShell>
  )
}
