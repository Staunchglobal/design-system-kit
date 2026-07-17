'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { SET_PASSWORD, type SetPasswordResult } from '@/components/auth/auth-operations'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { toast } from '@/components/auth/notify'
import { clearAuthHandoff } from '@/components/auth/auth-session'
import type { SetPasswordFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) go('/auth/forgot-password')
  }, [token])

  async function handleSubmit(values: SetPasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      await authFetch<SetPasswordResult>(SET_PASSWORD, {
        token,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
        resetPassword: true,
      })
      clearAuthHandoff()
      toast.success('Password updated — sign in with your new password')
      go('/auth/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <>
      <AuthShell title="Reset password" description="Choose a new strong password.">
        <SetPasswordForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="Reset password"
        />
      </AuthShell>
      <Toaster />
    </>
  )
}
