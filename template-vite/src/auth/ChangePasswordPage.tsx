'use client'

import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { UPDATE_PASSWORD, type UpdatePasswordResult } from '@/components/auth/auth-operations'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { toast } from '@/components/auth/notify'
import type { ChangePasswordFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

// Auth is already guaranteed by PrivateLayout wrapping this route.
export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(values: ChangePasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<UpdatePasswordResult>(UPDATE_PASSWORD, {
        input: {
          currentPassword: values.currentPassword,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        },
      })
      toast.success(data.updatePassword.success ? 'Password updated' : 'Password not updated')
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AuthShell
        title="Change password"
        description="Update the password for your signed-in account."
        footer={
          <Link to="/dashboard" className="text-foreground text-center underline-offset-4 hover:underline">
            Back to home
          </Link>
        }
      >
        <ChangePasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
