'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'
import { Suspense } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import {
  ACCEPT_INVITATION,
  type AcceptInvitationResult,
} from '@/components/auth/auth-operations'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { toast } from '@/components/auth/notify'
import type { SetPasswordFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

function AcceptInvitationInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Matches reset-password/page.tsx's own guard — without a real token,
  // there's nothing to accept. The old fallback ('invite-demo-token')
  // meant a visitor with no token got a live form that always failed with
  // a confusing backend error, and shipped a real credential-looking
  // string in this page's own visible copy.
  React.useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  async function handleSubmit(values: SetPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      await authFetch<AcceptInvitationResult>(ACCEPT_INVITATION, {
        input: { token, password: values.password, passwordConfirmation: values.passwordConfirmation },
      })
      // Accepting an invitation only creates the account — it doesn't issue a session,
      // so the new user still has to sign in.
      toast.success('Account created — sign in with your new password')
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invitation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Accept invitation" description="Set a password to join.">
      <SetPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        submitLabel="Accept & continue"
      />
    </AuthShell>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<AuthShell title="Accept invitation"><p className="text-muted-foreground text-sm">Loading…</p></AuthShell>}>
      <AcceptInvitationInner />
    </Suspense>
  )
}
