'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { clearAuthSession } from '@/components/auth/auth-session'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { toast } from '@/components/auth/notify'
import { Toaster } from '@/components/ui/sonner'

function go(path: string) {
  window.location.assign(path)
}

export default function AuthHomePage() {
  const session = useAuthSession()

  React.useEffect(() => {
    if (!session) go('/auth/login')
  }, [session])

  function logout() {
    clearAuthSession()
    toast.success('Signed out')
    go('/auth/login')
  }

  if (!session) return null

  return (
    <>
      <AuthShell
        title="You’re signed in"
        description={`${session.user.firstName} ${session.user.lastName} · ${session.user.email}`}
      >
        <div className="flex flex-col gap-3">
          <Button asChild variant="outline" className="w-full">
            <a href="/auth/change-password">Change password</a>
          </Button>
          <Button variant="secondary" className="w-full" onClick={logout}>
            Log out
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            Session is stored in localStorage (demo stub). Swap{' '}
            <code className="text-foreground">createAuthFetch</code> endpoint for a real API.
          </p>
        </div>
      </AuthShell>
      <Toaster />
    </>
  )
}
