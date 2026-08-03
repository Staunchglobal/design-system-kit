'use client'

import { CircleAlert } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

/** Inline API/form error banner (toast is reserved for success only). */
export function AuthFormError({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
