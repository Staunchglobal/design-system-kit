'use client'

import * as React from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { Button } from '@/components/ui/button'
import { RequestEmailChangeForm } from '@/components/account-settings/request-email-change-form'
import { useEmailChange } from '@/components/account-settings/use-email-change'

export type EmailChangeSettingsProps = {
  endpoint?: string
  onUnauthenticated?: () => void
}

export function EmailChangeSettings({ endpoint, onUnauthenticated }: EmailChangeSettingsProps) {
  const session = useAuthSession()
  const ec = useEmailChange({ endpoint })

  React.useEffect(() => {
    if (!session) onUnauthenticated?.()
  }, [session, onUnauthenticated])

  if (!session) return null

  if (ec.step === 'verify-current') {
    return (
      <AuthShell
        title="Verify your current email"
        description={`Enter the 6-digit code sent to ${session.user.email}.`}
      >
        <div className="flex flex-col gap-4">
          <VerifyOtpForm onSubmit={ec.verifyCurrent} loading={ec.loading} error={ec.error} />
          <Button type="button" variant="ghost" className="w-full" onClick={() => void ec.cancel()}>
            Cancel
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (ec.step === 'verify-new') {
    return (
      <AuthShell
        title="Verify your new email"
        description={`Enter the 6-digit code sent to ${ec.newEmail}.`}
      >
        <div className="flex flex-col gap-4">
          <VerifyOtpForm onSubmit={ec.verifyNew} loading={ec.loading} error={ec.error} />
          <Button type="button" variant="ghost" className="w-full" onClick={() => void ec.cancel()}>
            Cancel
          </Button>
        </div>
      </AuthShell>
    )
  }

  if (ec.step === 'done') {
    return (
      <AuthShell title="Email updated" description={`Your account email is now ${session.user.email}.`}>
        <Button className="w-full" onClick={ec.reset}>
          Done
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Change email"
      description={`Currently ${session.user.email}. You'll need to verify both your current and new email.`}
    >
      <RequestEmailChangeForm onSubmit={ec.request} loading={ec.loading} error={ec.error} />
    </AuthShell>
  )
}
