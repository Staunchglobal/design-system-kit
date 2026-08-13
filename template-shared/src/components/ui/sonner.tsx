'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { AppIcon } from '@/components/icons/icon'

// Every toast type renders on the same fixed light card (bg/text intentionally
// don't track the app's dark mode — matches `theme="light"` below); only the
// icon gets a colored circle per type. Sized to icon (1rem) + 2×padding
// (0.25rem) = 1.5rem, nudged up slightly to optically align with the title's
// first line (title line-height 1.25rem, so (1.25rem - 1.5rem)/2 = -0.125rem).
function ToastIcon({
  name,
  bgClassName,
}: {
  name: 'sonner.success' | 'sonner.info' | 'sonner.warning' | 'sonner.error'
  bgClassName: string
}) {
  return (
    <span
      className={`-mt-0.5 flex size-6 items-center justify-center rounded-full p-1 text-neutral-0 ${bgClassName}`}
    >
      <AppIcon name={name} className="size-4" />
    </span>
  )
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <ToastIcon name="sonner.success" bgClassName="bg-success-500" />,
        info: <ToastIcon name="sonner.info" bgClassName="bg-info-500" />,
        warning: <ToastIcon name="sonner.warning" bgClassName="bg-warning-500" />,
        error: <ToastIcon name="sonner.error" bgClassName="bg-destructive-500" />,
        loading: <AppIcon name="sonner.loading" className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'bg-neutral-0 text-primary-950 border-border items-start gap-2 p-3 text-sm shadow-(--shadow-xs)',
          title: 'leading-5',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
