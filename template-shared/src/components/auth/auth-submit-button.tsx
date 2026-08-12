'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export type AuthSubmitButtonProps = {
  loading?: boolean
  loadingLabel?: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

/** Full-width submit CTA: spinner + disabled while loading. */
export function AuthSubmitButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={className ?? 'w-full'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <Spinner className="size-4" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
