'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'
import { Button } from '@/components/ui/button'

// New component — ported from saferHealth-web's banner (banner.tsx +
// constants.ts + banner-icons.tsx). Structurally modeled on this kit's
// alert.tsx: cva for variants, `data-slot` attributes, `cn` from
// `@/lib/utils`. Unlike Alert, Banner takes `title`/`description` as props
// (not composable children) and renders full-width with only a bottom
// border (an edge-to-edge strip, not a bordered card) — matching
// saferHealth's own Alert-vs-Banner distinction.
const bannerVariants = cva('group/banner flex w-full items-center gap-2 border-b px-3 py-2 text-left', {
  variants: {
    variant: {
      info: 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950',
      warning: 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950',
      error: 'border-destructive-200 bg-destructive-50 dark:border-destructive-800 dark:bg-destructive-950',
      success: 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

const bannerIconVariants = cva(
  "flex size-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:size-5 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        info: 'text-info-700 dark:text-info-400',
        warning: 'text-warning-700 dark:text-warning-400',
        error: 'text-destructive-700 dark:text-destructive-400',
        success: 'text-success-700 dark:text-success-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

type BannerVariant = NonNullable<VariantProps<typeof bannerVariants>['variant']>

const BANNER_ICON_NAME: Record<BannerVariant, string> = {
  info: 'banner.info',
  warning: 'banner.warning',
  error: 'banner.error',
  success: 'banner.success',
}

type BannerProps = Omit<React.ComponentProps<'div'>, 'title'> &
  VariantProps<typeof bannerVariants> & {
    action?: React.ReactNode
    description?: React.ReactNode
    icon?: React.ReactNode | null
    onAction?: () => void
    onClose?: () => void
    title: React.ReactNode
  }

function Banner({
  action,
  className,
  description,
  icon,
  onAction,
  onClose,
  title,
  variant = 'info',
  ...props
}: BannerProps) {
  const resolvedVariant: BannerVariant = variant ?? 'info'
  const resolvedIcon = resolveBannerIcon(icon, resolvedVariant)
  const showActions = action != null || onClose != null

  return (
    <div
      data-slot="banner"
      data-variant={resolvedVariant}
      role="status"
      className={cn(bannerVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      <div data-slot="banner-content" className="flex min-w-0 flex-1 items-start gap-2">
        {resolvedIcon}
        <div data-slot="banner-text" className="flex min-w-0 flex-1 flex-col">
          <div data-slot="banner-title" className="text-sm font-medium text-foreground">
            {title}
          </div>
          {description != null && description !== '' ? (
            <div data-slot="banner-description" className="text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      </div>
      {showActions ? (
        <div data-slot="banner-action" className="flex shrink-0 items-center gap-1">
          {renderBannerAction(action, onAction)}
          {onClose ? (
            <Button
              aria-label="Close"
              data-slot="banner-close"
              onClick={onClose}
              size="icon-xs"
              variant="ghost"
            >
              <AppIcon name="banner.close" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function renderBannerAction(action: React.ReactNode, onAction?: () => void) {
  if (action == null) {
    return null
  }

  if (typeof action === 'string' || typeof action === 'number') {
    return (
      <Button onClick={onAction} size="sm" variant="ghost">
        {action}
      </Button>
    )
  }

  return action
}

function resolveBannerIcon(icon: React.ReactNode | null | undefined, variant: BannerVariant) {
  if (icon === null) {
    return null
  }

  if (icon !== undefined) {
    return (
      <span data-slot="banner-icon" className={cn(bannerIconVariants({ variant }))}>
        {icon}
      </span>
    )
  }

  return (
    <span data-slot="banner-icon" className={cn(bannerIconVariants({ variant }))}>
      <AppIcon name={BANNER_ICON_NAME[variant]} />
    </span>
  )
}

export { Banner, bannerVariants }
export type { BannerProps, BannerVariant }
