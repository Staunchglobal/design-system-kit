'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'

type CopyInputProps = {
  value: string
  editable?: boolean
  onValueChange?: (value: string) => void
  copyLabel?: string
  copiedLabel?: string
  className?: string
  inputClassName?: string
}

function CopyInput({
  value,
  editable = false,
  onValueChange,
  copyLabel = 'Copy',
  copiedLabel = 'Copied!',
  className,
  inputClassName,
}: CopyInputProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard may be unavailable in insecure contexts — leave UI unchanged.
    }
  }

  return (
    <InputGroup data-slot="copy-input" className={cn(className)}>
      <InputGroupInput
        readOnly={!editable || !onValueChange}
        value={value}
        onChange={
          editable && onValueChange
            ? (e) => onValueChange(e.target.value)
            : undefined
        }
        className={inputClassName}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="xs"
          variant="ghost"
          aria-label={copied ? copiedLabel : copyLabel}
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="sr-only sm:not-sr-only">{copied ? copiedLabel : copyLabel}</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { CopyInput }
export type { CopyInputProps }
