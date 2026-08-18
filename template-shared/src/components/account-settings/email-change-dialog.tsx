'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { VerifyOtpForm } from '@/components/auth/verify-otp-form'
import { NewEmailForm } from '@/components/account-settings/new-email-form'
import type { OtpFormValues } from '@/components/auth/types'
import type { EmailChangeDialogStep } from '@/components/account-settings/use-email-change-dialog'

export type EmailChangeDialogProps = {
  open: boolean
  step: EmailChangeDialogStep
  currentEmail: string
  newEmail: string
  loading: boolean
  resendLoading: boolean
  error: string | null
  otpHint: string | null
  onVerifyCurrent: (values: OtpFormValues) => void | Promise<void>
  onSubmitNewEmail: (newEmail: string) => void | Promise<void>
  onVerifyNew: (values: OtpFormValues) => void | Promise<void>
  onResend: () => void | Promise<void>
  onCancel: () => void | Promise<void>
}

export function EmailChangeDialog({
  open,
  step,
  currentEmail,
  newEmail,
  loading,
  resendLoading,
  error,
  otpHint,
  onVerifyCurrent,
  onSubmitNewEmail,
  onVerifyNew,
  onResend,
  onCancel,
}: EmailChangeDialogProps) {
  return (
    // Deliberately NOT dismissible by clicking outside or pressing Escape —
    // a pending verification is a live server-side record
    // (cancelEmailChange) that has to be told the user gave up, not just a
    // local reset, so the only two ways out are the Cancel button (below)
    // and the built-in X (both of which route through onCancel via
    // onOpenChange).
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) void onCancel()
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === 'verify-current' ? (
          <>
            <DialogHeader>
              <DialogTitle>Verify your current email</DialogTitle>
              <DialogDescription>Enter the 6-digit code sent to {currentEmail}.</DialogDescription>
            </DialogHeader>
            <VerifyOtpForm
              onSubmit={onVerifyCurrent}
              onResend={onResend}
              loading={loading}
              resendLoading={resendLoading}
              error={error}
              otpHint={otpHint}
              startTimerOnMount
            />
          </>
        ) : null}

        {step === 'enter-new-email' ? (
          <>
            <DialogHeader>
              <DialogTitle>Enter your new email</DialogTitle>
              <DialogDescription>We&apos;ll send a verification code to confirm it.</DialogDescription>
            </DialogHeader>
            <NewEmailForm onSubmit={onSubmitNewEmail} loading={loading} error={error} />
          </>
        ) : null}

        {step === 'verify-new' ? (
          <>
            <DialogHeader>
              <DialogTitle>Verify your new email</DialogTitle>
              <DialogDescription>Enter the 6-digit code sent to {newEmail}.</DialogDescription>
            </DialogHeader>
            <VerifyOtpForm
              onSubmit={onVerifyNew}
              onResend={onResend}
              loading={loading}
              resendLoading={resendLoading}
              error={error}
              otpHint={otpHint}
              startTimerOnMount
            />
          </>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => void onCancel()} disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
