'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { useAuthSession } from '@/components/auth/use-auth-store'
import { createAuthFetch } from '@/components/auth/auth-fetch'
import { UPDATE_PASSWORD, type UpdatePasswordResult } from '@/components/auth/auth-operations'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import type { ChangePasswordFormValues } from '@/components/auth/types'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmailChangeDialog } from '@/components/account-settings/email-change-dialog'
import { useEmailChangeDialog } from '@/components/account-settings/use-email-change-dialog'

export type AccountSettingsScreenProps = {
  endpoint?: string
  onUnauthenticated?: () => void
}

export function AccountSettingsScreen({ endpoint, onUnauthenticated }: AccountSettingsScreenProps) {
  const session = useAuthSession()
  const ec = useEmailChangeDialog({ endpoint })
  const authFetch = React.useMemo(() => createAuthFetch({ endpoint }), [endpoint])
  const [pwLoading, setPwLoading] = React.useState(false)
  const [pwError, setPwError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!session) onUnauthenticated?.()
  }, [session, onUnauthenticated])

  if (!session) return null

  async function handleChangePassword(values: ChangePasswordFormValues) {
    setPwLoading(true)
    setPwError(null)
    try {
      const data = await authFetch<UpdatePasswordResult>(UPDATE_PASSWORD, {
        input: {
          currentPassword: values.currentPassword,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        },
      })
      toast.success(data.updatePassword.success ? 'Password updated' : 'Password not updated')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 min-[1400px]:max-w-[1320px]"
      data-slot="crud-page"
    >
      <header
        data-slot="crud-header"
        className="flex w-full flex-wrap items-start justify-between gap-x-4 gap-y-3"
      >
        <div data-slot="crud-header-copy" className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
          <div data-slot="crud-header-title-row" className="flex flex-wrap items-center gap-2">
            <h2 data-slot="crud-header-title" className="text-foreground m-0 font-sans text-2xl font-semibold">
              Account settings
            </h2>
          </div>
          <p data-slot="crud-header-description" className="text-muted-600 m-0 text-sm">
            Manage your email and password.
          </p>
        </div>
      </header>

      <div className="flex max-w-md flex-col gap-8">
        <section className="flex flex-col gap-3">
          <Field>
            <FieldLabel htmlFor="account-email">Email</FieldLabel>
            <Input id="account-email" value={session.user.email} disabled readOnly />
          </Field>
          <Button
            type="button"
            variant="link"
            className="self-start"
            onClick={() => void ec.start()}
            disabled={ec.starting}
          >
            {ec.starting ? 'Sending code…' : 'Change email'}
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Password</h3>
          <ChangePasswordForm onSubmit={handleChangePassword} loading={pwLoading} error={pwError} />
        </section>
      </div>

      <EmailChangeDialog
        open={ec.open}
        step={ec.step}
        currentEmail={session.user.email}
        newEmail={ec.newEmail}
        loading={ec.loading}
        resendLoading={ec.resendLoading}
        error={ec.error}
        otpHint={ec.otpHint}
        onVerifyCurrent={ec.verifyCurrent}
        onSubmitNewEmail={ec.submitNewEmail}
        onVerifyNew={ec.verifyNew}
        onResend={ec.resend}
        onCancel={ec.cancel}
      />
    </div>
  )
}
