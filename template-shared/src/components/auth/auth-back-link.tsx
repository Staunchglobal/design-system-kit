'use client'

import * as React from 'react'

import { AppIcon } from '@/components/icons/icon'
import { cn } from '@/lib/utils'

export type AuthBackLinkProps = {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  LinkComponent?: React.ElementType
  className?: string
}

/**
 * Auth back control: link + chevron before the label.
 *
 * Deliberately not the `Button` component — the theme's `[data-slot='button']`
 * rules outrank utility classes, so a link-styled Button keeps its 1rem inline
 * padding and 3rem height and can't sit flush with the card edge.
 */
export function AuthBackLink({
  children,
  href,
  onClick,
  LinkComponent = 'a',
  className,
}: AuthBackLinkProps) {
  const classNames = cn(
    'text-primary hover:text-primary/80 -ml-1 inline-flex w-fit items-center gap-1 text-sm font-medium underline-offset-4 hover:underline',
    className
  )

  const content = (
    <>
      <AppIcon name="auth.back" className="size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </>
  )

  if (onClick && !href) {
    return (
      <button type="button" className={classNames} onClick={onClick}>
        {content}
      </button>
    )
  }

  const Link = LinkComponent
  return (
    <Link href={href} className={classNames} onClick={onClick}>
      {content}
    </Link>
  )
}
