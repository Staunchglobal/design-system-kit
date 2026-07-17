'use client'

import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'

/**
 * Auth route layout — mounts Toaster for toast feedback on these pages.
 * Forms live in Card shells on each page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
