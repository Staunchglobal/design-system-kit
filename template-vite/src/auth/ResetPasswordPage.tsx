'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { RESET_PASSWORD, type ResetPasswordResult } from '@/components/auth/auth-operations'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { toast } from '@/components/auth/notify'
import { setAuthSession } from '@/components/auth/auth-session'
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
      const data = await authFetch<ResetPasswordResult>(RESET_PASSWORD, {
        input: {
          resetPasswordToken: token,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        },
      })
      if (data.resetPassword.token && data.resetPassword.user) {
        setAuthSession({ token: data.resetPassword.token, user: data.resetPassword.user })
        toast.success('Password updated')
        go('/auth/home')
        return
      }
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
