/**
 * Opt-in account-settings feature entry — filesystem discovery picks up slug `account-settings`.
 * Prefer importing from `@/components/account-settings/*` directly. Requires the `auth` slug
 * (uses its session store, OTP-entry form, and change-password form).
 */
export { AccountSettingsScreen } from '@/components/account-settings/account-settings-screen'
export { EmailChangeDialog } from '@/components/account-settings/email-change-dialog'
export { NewEmailForm } from '@/components/account-settings/new-email-form'
export {
  useEmailChangeDialog,
  type EmailChangeDialogStep,
} from '@/components/account-settings/use-email-change-dialog'
export { createAccountSettingsFetch } from '@/components/account-settings/account-settings-fetch'
export { Toaster } from '@/components/ui/sonner'
// Registers `auth` as a dependency — this slug builds on its session store,
// OTP-entry form, and change-password form, so it must be installed
// alongside this one.
export { ChangePasswordForm, VerifyOtpForm } from '@/components/ui/auth'
