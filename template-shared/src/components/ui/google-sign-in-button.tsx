'use client'

import * as React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void
  onError?: (error: unknown) => void
  label?: string
  className?: string
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.14 2.77-2.42 3.62v3.01h3.9c2.29-2.1 3.56-5.2 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.9-3.01c-1.08.73-2.47 1.16-4.05 1.16-3.11 0-5.75-2.1-6.69-4.93H1.28v3.11C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.31V6.58H1.28A11.99 11.99 0 0 0 0 12c0 1.93.46 3.77 1.28 5.42l4.03-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.58l4.03 3.11C6.25 6.86 8.89 4.77 12 4.77Z"
      />
    </svg>
  )
}

/**
 * Design-system-styled "Continue with Google" button that still completes
 * the real ID-token credential flow — `@react-oauth/google`'s own
 * `GoogleLogin` component only exposes Google's own preset visual options
 * (theme/size/shape), no custom colors/border/typography, so matching this
 * kit's own button styling means rendering our own `<Button>` and letting
 * the real (invisible) Google widget sit on top to actually receive the
 * click. The decorative button is `aria-hidden`/unfocusable — the real,
 * keyboard-accessible Google button underneath is the only thing screen
 * readers and keyboard users interact with.
 */
function GoogleSignInButton({
  onCredential,
  onError,
  label = 'Continue with Google',
  className,
}: GoogleSignInButtonProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState<number>()

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next) setWidth(Math.round(next))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  function handleSuccess(response: CredentialResponse) {
    if (response.credential) {
      onCredential(response.credential)
      return
    }
    onError?.(new Error('Google did not return an ID token credential.'))
  }

  return (
    <div
      ref={containerRef}
      data-slot="google-sign-in-button"
      className={cn('relative isolate w-full overflow-hidden rounded-lg', className)}
    >
      <Button type="button" variant="outline" className="w-full gap-2" aria-hidden tabIndex={-1}>
        <GoogleIcon className="size-4" />
        {label}
      </Button>
      {width ? (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-lg opacity-0">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError?.(new Error('Google sign-in failed or was dismissed.'))}
            width={String(width)}
          />
        </div>
      ) : null}
    </div>
  )
}

export { GoogleSignInButton }
export type { GoogleSignInButtonProps }
