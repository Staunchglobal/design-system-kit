'use client'

/**
 * GoogleSignInButton — wraps @react-oauth/google's <GoogleLogin> branded widget.
 *
 * RENDERING NOTE: GoogleLogin renders Google's own button via the Google Identity
 * Services script (an iframe-backed element). It does NOT support arbitrary children
 * or shadcn Button rendering — any attempt to swap the inner element would bypass
 * Google's required branding and break the credential flow. This component exposes
 * styling through `wrapperClassName` (the surrounding div) and GoogleLogin's own
 * visual props (theme, size, shape, text).
 *
 * PROVIDER REQUIREMENT: Wrap your app (or route) with:
 *   import { GoogleOAuthProvider } from '@react-oauth/google'
 *   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">…</GoogleOAuthProvider>
 *
 * CREDENTIAL FLOW: onCredential receives a JWT ID token (credentialResponse.credential).
 * Verify this token server-side via Google's tokeninfo endpoint or a library like
 * google-auth-library before trusting the identity it asserts.
 */

import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'

import { cn } from '@/lib/utils'

type GoogleSignInButtonProps = {
  /**
   * Called with Google's JWT ID token on successful sign-in.
   * Send it to your backend for verification before trusting the identity.
   */
  onCredential: (credential: string) => void
  /**
   * Called when the Google sign-in flow fails or is dismissed.
   * GoogleLogin does not surface an error detail in this callback.
   */
  onError?: (error: unknown) => void
  /** Visual theme for the Google button. Defaults to 'outline'. */
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  /** Button size. Defaults to 'large'. */
  size?: 'large' | 'medium' | 'small'
  /** Button shape. Defaults to 'rectangular'. */
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  /** Button text. Defaults to 'signin_with'. */
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  /**
   * Button width in pixels (passed as a string, e.g. "400").
   * Google caps this; values below ~200 or above ~400 may be ignored.
   */
  width?: string
  /** className applied to the wrapping div — use for layout/alignment. */
  className?: string
}

/**
 * A Google sign-in button backed by the Google Identity Services API.
 * Renders Google's own branded widget; does not use shadcn's Button.
 */
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
