'use client'

import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { RESET_PASSWORD, type ResetPasswordResult } from '@/components/auth/auth-operations'
import { SetPasswordForm } from '@/components/auth/set-password-form'
import { toast } from '@/components/auth/notify'
import { setAuthSession } from '@/components/auth/auth-session'
import type { SetPasswordFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) navigate('/forgot-password')
  }, [token, navigate])

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
        navigate('/dashboard')
        return
      }
      toast.success('Password updated — sign in with your new password')
      navigate('/login')
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
