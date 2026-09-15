'use client'

import * as React from 'react'
import { Separator as SeparatorPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'flex shrink-0',
        orientation === 'horizontal'
          ? 'w-full items-center py-2'
          : 'h-full justify-center self-stretch px-3',
        className
      )}
      {...props}
    >
      <span
        data-slot="separator-line"
        className={cn(
          'bg-border shrink-0',
          orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px'
        )}
      />
    </SeparatorPrimitive.Root>
  )
}

export { Separator }
