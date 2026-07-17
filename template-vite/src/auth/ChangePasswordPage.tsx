'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { UPDATE_PASSWORD, type UpdatePasswordResult } from '@/components/auth/auth-operations'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { toast } from '@/components/auth/notify'
import { useAuthSession } from '@/components/auth/use-auth-store'
import type { ChangePasswordFormValues } from '@/components/auth/types'
import { Toaster } from '@/components/ui/sonner'

const authFetch = createAuthFetch()

function go(path: string) {
  window.location.assign(path)
}

export default function ChangePasswordPage() {
  const session = useAuthSession()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!session) go('/auth/login')
  }, [session])

  async function handleSubmit(values: ChangePasswordFormValues) {
    setLoading(true)
    setError(null)
    try {
      const data = await authFetch<UpdatePasswordResult>(UPDATE_PASSWORD, {
        currentPassword: values.currentPassword,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })
      toast.success(data.updatePassword.response)
      go('/auth/home')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <>
      <AuthShell
        title="Change password"
        description="Update the password for your signed-in account."
        footer={
          <a href="/auth/home" className="text-foreground text-center underline-offset-4 hover:underline">
            Back to home
          </a>
        }
      >
        <ChangePasswordForm onSubmit={handleSubmit} loading={loading} error={error} />
      </AuthShell>
      <Toaster />
    </>
  )
}
