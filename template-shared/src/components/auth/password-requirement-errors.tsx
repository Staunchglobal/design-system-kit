'use client'

import { FieldError } from '@/components/ui/field'

export function PasswordRequirementErrors({ errors }: { errors: string[] }) {
  if (!errors.length) return null

  return (
    <FieldError>
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </FieldError>
  )
}
