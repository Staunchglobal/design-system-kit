'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { AppIcon } from '@/components/icons/icon'
import { Button } from '@/components/ui/button'

// Layout/spacing/colors ported from saferHealth-web's alert (constants.ts +
// alert.tsx's auto-icon resolution). Variant NAMES are kept as this kit's
// existing set (default/destructive/success/warning/info — `destructive` is
// used by chat-status.tsx, auth-form-error.tsx, payment-method-form.tsx)
// rather than renamed to saferHealth's info/warning/error/success; the
// unnamed variant now defaults to `info` (matching saferHealth's own
// `variant = 'info'` default) while `default` stays available as an explicit
// neutral option. AlertTitle/AlertDescription stay `<div>` (not saferHealth's
// `<p>`) because chat-status.tsx nests a `<p>` and a `<Button>` inside
// AlertDescription — nesting those inside a real `<p>` would be invalid HTML.
const alertVariants = cva(
  'group/alert flex w-full items-center gap-2 rounded-[8px] border px-3 py-2 text-left',
  {
    variants: {
      variant: {
        default: 'border-border bg-neutral-50 dark:bg-neutral-900',
        destructive:
          'border-destructive-200 bg-destructive-50 dark:border-destructive-800 dark:bg-destructive-950',
        success: 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-950',
        warning: 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-950',
        info: 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-950',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

const alertIconVariants = cva(
  "flex size-5 shrink-0 items-center justify-center overflow-hidden [&>svg]:size-5 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: 'text-foreground',
        destructive: 'text-destructive-700 dark:text-destructive-400',
        success: 'text-success-700 dark:text-success-400',
        warning: 'text-warning-700 dark:text-warning-400',
        info: 'text-info-700 dark:text-info-400',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
)

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

const ALERT_ICON_NAME: Record<AlertVariant, string> = {
  default: 'alert.info',
  destructive: 'alert.error',
  success: 'alert.success',
  warning: 'alert.warning',
  info: 'alert.info',
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('font-sans text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="alert-action" className={cn('flex shrink-0 items-center gap-1', className)} {...props} />
  )
}

function AlertClose({
  className,
  'aria-label': ariaLabel = 'Close',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      aria-label={ariaLabel}
      data-slot="alert-close"
      size="icon-xs"
      variant="ghost"
      className={className}
      {...props}
    >
      <AppIcon name="alert.close" />
    </Button>
  )
}

function isElementOfType<P>(
  child: React.ReactNode,
  component: (props: P) => React.ReactNode
): child is React.ReactElement<P> {
  return React.isValidElement(child) && child.type === component
}

function Alert({
  children,
  className,
  icon,
  variant = 'info',
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof alertVariants> & { icon?: React.ReactNode | null }) {
  const resolvedVariant: AlertVariant = variant ?? 'info'
  const nodes = React.Children.toArray(children)
  const title = nodes.find((child) => isElementOfType(child, AlertTitle))
  const description = nodes.find((child) => isElementOfType(child, AlertDescription))
  const action = nodes.find((child) => isElementOfType(child, AlertAction))
  const rest = nodes.filter(
    (child) =>
      !isElementOfType(child, AlertTitle) &&
      !isElementOfType(child, AlertDescription) &&
      !isElementOfType(child, AlertAction)
  )
  const resolvedIcon = resolveAlertIcon(icon, rest, resolvedVariant)

  return (
    <div
      data-slot="alert"
      data-variant={resolvedVariant}
      role="alert"
      className={cn(alertVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {resolvedIcon || title || description ? (
        <div data-slot="alert-content" className="flex min-w-0 flex-1 items-start gap-2">
          {resolvedIcon}
          {title || description ? (
            <div data-slot="alert-text" className="flex min-w-0 flex-1 flex-col">
              {title}
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
      {action}
    </div>
  )
}

function resolveAlertIcon(
  icon: React.ReactNode | null | undefined,
  rest: React.ReactNode[],
  variant: AlertVariant
) {
  if (icon === null) {
    return null
  }

  if (icon !== undefined) {
    return (
      <span data-slot="alert-icon" className={cn(alertIconVariants({ variant }))}>
        {icon}
      </span>
    )
  }

  if (rest.length > 0) {
    return (
      <span data-slot="alert-icon" className={cn(alertIconVariants({ variant }))}>
        {rest}
      </span>
    )
  }

  return (
    <span data-slot="alert-icon" className={cn(alertIconVariants({ variant }))}>
      <AppIcon name={ALERT_ICON_NAME[variant]} />
    </span>
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, AlertClose, alertVariants }
export type { AlertVariant }
