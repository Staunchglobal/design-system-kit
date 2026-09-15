'use client'

import type { CSSProperties } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { AppIcon } from '@/components/icons/icon'

// Styling ported from saferHealth-web's toast (constants.ts/toaster.tsx):
// every toast renders on a fixed dark "surface-black" card (bg/text
// intentionally don't track the app's light/dark theme — matches
// `theme="light"` below) with a close button, unlike this kit's previous
// light bordered card. Status icons sit in a colored circle chip
// (bg-<status>-50 + text-<status>-700) with a plain glyph, distinct from
// Alert/Banner's self-contained filled-circle icons.
function ToastIcon({
  name,
  bgClassName,
  iconClassName,
}: {
  name: 'sonner.success' | 'sonner.info' | 'sonner.warning' | 'sonner.error'
  bgClassName: string
  iconClassName: string
}) {
  return (
    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full p-1 ${bgClassName}`}>
      <AppIcon name={name} className={`size-4 ${iconClassName}`} />
    </span>
  )
}

function ToastCloseIcon() {
  return <AppIcon name="sonner.close" className="size-6 text-neutral-0" />
}

const toasterStyle = {
  '--normal-bg': 'var(--neutral-900)',
  '--normal-text': 'var(--neutral-0)',
  '--normal-border': 'transparent',
  '--border-radius': '12px',
  '--width': '358px',
  '--toast-close-button-start': 'unset',
  '--toast-close-button-end': '0px',
  '--toast-close-button-transform': 'none',
} as CSSProperties

const Toaster = ({ position = 'top-right', toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      gap={12}
      offset={20}
      style={toasterStyle}
      icons={{
        success: <ToastIcon name="sonner.success" bgClassName="bg-success-50" iconClassName="text-success-700" />,
        info: <ToastIcon name="sonner.info" bgClassName="bg-info-50" iconClassName="text-info-700" />,
        warning: (
          <ToastIcon name="sonner.warning" bgClassName="bg-warning-50" iconClassName="text-warning-700" />
        ),
        error: (
          <ToastIcon name="sonner.error" bgClassName="bg-destructive-50" iconClassName="text-destructive-700" />
        ),
        loading: <AppIcon name="sonner.loading" className="size-4 animate-spin text-neutral-0" />,
        close: <ToastCloseIcon />,
      }}
      {...props}
      position={position}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            'items-center gap-3 border-0 bg-neutral-900 px-4 py-3 text-sm text-neutral-0 shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)] [&_[data-close-button]]:order-last [&_[data-close-button]]:static',
          title: 'leading-5 font-medium text-neutral-0',
          description: 'text-neutral-0/80',
          icon: 'size-6! h-6! w-6! m-0!',
          actionButton:
            'h-auto! bg-transparent! px-2.5! py-1.5! text-sm! font-medium! text-neutral-0! shadow-none! hover:bg-neutral-0/10!',
          closeButton:
            'static! inset-auto! left-auto! right-auto! top-auto! order-last! size-6! transform-none! rounded-[4px]! border-0! bg-transparent! text-neutral-0! shadow-none! hover:bg-neutral-0/10!',
          default: 'w-max! rounded-full px-6',
          ...toastOptions?.classNames,
        },
      }}
    />
  )
}

export { Toaster }
