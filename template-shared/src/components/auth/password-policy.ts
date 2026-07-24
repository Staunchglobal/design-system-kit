export const PASSWORD_POLICY_MESSAGE =
  'At least 8 characters, with one uppercase letter, one number, and one special character.'

const REQUIREMENTS = [
  {
    id: 'length',
    message: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    message: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'number',
    message: 'One number',
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    message: 'One special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
] as const

export function getPasswordRequirementErrors(password: string): string[] {
  if (!password) return ['Password is required']
  return REQUIREMENTS.filter((r) => !r.test(password)).map((r) => r.message)
}

export function isPasswordStrong(password: string): boolean {
  if (!password) return false
  return getPasswordRequirementErrors(password).length === 0
}

export function validatePassword(password: string): string | null {
  const errors = getPasswordRequirementErrors(password)
  return errors[0] ?? null
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address'
  return null
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`
  return null
}

export function validatePasswordConfirmation(
  password: string,
  passwordConfirmation: string
): string | null {
  if (!passwordConfirmation) return 'Password confirmation is required'
  if (password !== passwordConfirmation) return 'Passwords do not match'
  return null
}
