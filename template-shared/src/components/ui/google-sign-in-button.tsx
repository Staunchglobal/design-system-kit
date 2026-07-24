'use client'

import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'

import { cn } from '@/lib/utils'

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void
  onError?: (error: unknown) => void
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  width?: string
  className?: string
}

function GoogleSignInButton({
  onCredential,
  onError,
  theme = 'outline',
  size = 'large',
  shape = 'rectangular',
  text = 'signin_with',
  width,
  className,
}: GoogleSignInButtonProps) {
  function handleSuccess(response: CredentialResponse) {
    if (response.credential) {
      onCredential(response.credential)
      return
    }
    onError?.(new Error('Google did not return an ID token credential.'))
  }

  return (
    <div
      data-slot="google-sign-in-button"
      className={cn('flex items-center justify-center', className)}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.(new Error('Google sign-in failed or was dismissed.'))}
        theme={theme}
        size={size}
        shape={shape}
        text={text}
        width={width}
      />
    </div>
  )
}

export { GoogleSignInButton }
export type { GoogleSignInButtonProps }
