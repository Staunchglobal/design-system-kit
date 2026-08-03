/**
 * Opt-in account-settings feature entry — filesystem discovery picks up slug `account-settings`.
 * Prefer importing from `@/components/account-settings/*` directly. Requires the `auth` slug
 * (uses its session store, AuthShell, and OTP-entry form).
 */
export { EmailChangeSettings } from '@/components/account-settings/email-change-settings'
export { RequestEmailChangeForm } from '@/components/account-settings/request-email-change-form'
export { useEmailChange } from '@/components/account-settings/use-email-change'
export { createAccountSettingsFetch } from '@/components/account-settings/account-settings-fetch'
export { Toaster } from '@/components/ui/sonner'
// Registers `auth` as a dependency — this slug builds on its session store, AuthShell, and
// OTP-entry form, so it must be installed alongside this one.
export { AuthShell } from '@/components/ui/auth'
