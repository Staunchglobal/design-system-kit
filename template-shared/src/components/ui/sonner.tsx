'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { AppIcon } from '@/components/icons/icon'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <AppIcon name="sonner.success" className="size-4" />,
        info: <AppIcon name="sonner.info" className="size-4" />,
        warning: <AppIcon name="sonner.warning" className="size-4" />,
        error: <AppIcon name="sonner.error" className="size-4" />,
        loading: <AppIcon name="sonner.loading" className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--neutral-900)',
          '--normal-text': 'var(--neutral-0)',
          '--normal-border': 'transparent',
          '--border-radius': 'var(--radius-md)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'cn-toast',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
