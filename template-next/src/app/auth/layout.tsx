'use client'

import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
