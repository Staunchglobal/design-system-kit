'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export type AuthShellProps = {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  logo?: React.ReactNode
  className?: string
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  logo,
  className,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        'bg-muted/40 flex min-h-svh flex-col items-center justify-center p-4',
        className
      )}
    >
      <div className="w-full max-w-md">
        {logo ? <div className="mb-6 flex justify-center">{logo}</div> : null}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </CardHeader>
          <CardContent>{children}</CardContent>
          {footer ? (
            <>
              <Separator />
              <CardFooter className="text-muted-foreground flex flex-col items-stretch gap-2 text-sm">
                {footer}
              </CardFooter>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
