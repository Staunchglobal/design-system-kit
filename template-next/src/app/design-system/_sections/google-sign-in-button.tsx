'use client'

import * as React from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button'

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function GoogleSignInButtonDemo() {
  const [credential, setCredential] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <ComponentSection
      id="google-sign-in-button"
      title="Google Sign-In Button"
      description="Credential / ID-token flow via @react-oauth/google. Requires GoogleOAuthProvider at the app root. Uses Google's branded widget (not a shadcn Button)."
    >
      <Example title="Sign in" contentClassName="block space-y-3">
        {CLIENT_ID ? (
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <GoogleSignInButton
              onCredential={(token) => {
                setError(null)
                setCredential(token)
              }}
              onError={(err) => {
                setCredential(null)
                setError(err instanceof Error ? err.message : 'Sign-in failed')
              }}
            />
          </GoogleOAuthProvider>
        ) : (
          <p className="text-muted-foreground text-sm">
            Set <code className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and wrap your
            app in <code className="font-mono text-xs">GoogleOAuthProvider</code> to enable the button.
          </p>
        )}
        {credential ? (
          <p className="text-muted-foreground break-all text-xs">
            Received credential (truncated): {credential.slice(0, 48)}…
          </p>
        ) : null}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </Example>
    </ComponentSection>
  )
}
