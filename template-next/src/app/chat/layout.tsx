'use client'

import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
