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
import { setAuthSession } from '@/components/auth/auth-session'
import type { SetPasswordFormValues } from '@/components/auth/types'

const authFetch = createAuthFetch()

function AcceptInvitationInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? 'invite-demo-token'
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: SetPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<AcceptInvitationResult>(ACCEPT_INVITATION, {
        token,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })
      setAuthSession({
        token: data.acceptInvitation.token,
        user: data.acceptInvitation.user,
      })
      toast.success('Invitation accepted')
      router.push('/auth/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invitation failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Accept invitation"
      description="Set a password to join. Demo token: invite-demo-token"
    >
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
