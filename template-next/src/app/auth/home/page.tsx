'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { clearAuthSession } from '@/components/auth/auth-session'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { toast } from '@/components/auth/notify'

export default function AuthHomePage() {
  const router = useRouter()
  const session = useAuthSession()

  React.useEffect(() => {
    if (!session) router.replace('/auth/login')
  }, [session, router])

  function logout() {
    clearAuthSession()
    toast.success('Signed out')
    router.push('/auth/login')
  }

  if (!session) return null

  return (
    <AuthShell
      title="You’re signed in"
      description={`${session.user.firstName} ${session.user.lastName} · ${session.user.email}`}
    >
      <div className="flex flex-col gap-3">
        <Button asChild variant="outline" className="w-full">
          <Link href="/auth/change-password">Change password</Link>
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
  )
}
