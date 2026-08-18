export { AccountSettingsScreen } from '@/components/account-settings/account-settings-screen'
export { EmailChangeDialog } from '@/components/account-settings/email-change-dialog'
export { NewEmailForm } from '@/components/account-settings/new-email-form'
export {
  useEmailChangeDialog,
  type EmailChangeDialogStep,
} from '@/components/account-settings/use-email-change-dialog'
export { createAccountSettingsFetch } from '@/components/account-settings/account-settings-fetch'
export {
  accountSettingsMockFetch,
  ACCOUNT_SETTINGS_MOCK_ENDPOINT,
} from '@/components/account-settings/account-settings-mock-client'
export {
  REQUEST_EMAIL_CHANGE,
  VERIFY_CURRENT_EMAIL_CHANGE,
  REQUEST_NEW_EMAIL_CHANGE,
  VERIFY_NEW_EMAIL_CHANGE,
  RESEND_EMAIL_CHANGE_OTP,
  CANCEL_EMAIL_CHANGE,
} from '@/components/account-settings/account-settings-operations'
