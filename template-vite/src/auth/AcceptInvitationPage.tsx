'use client'

import * as React from 'react'

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
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function AcceptInvitationPage() {
  const token =
    new URLSearchParams(window.location.search).get('token') ?? 'invite-demo-token'
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
      go('/auth/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invitation failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
      <Toaster />
    </>
  )
}
