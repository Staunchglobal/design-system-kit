'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export type ChatSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  /** Show trailing spinner while debounce is pending or a search fetch is running. */
  searching?: boolean
  placeholder?: string
  'aria-label'?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
}

/**
 * Shared chat search input — keeps focus while searching and shows a spinner
 * as soon as debounce starts (and through the following fetch).
 */
export function ChatSearchField({
  value,
  onChange,
  searching = false,
  placeholder = 'Search…',
  'aria-label': ariaLabel = 'Search',
  disabled,
  className,
  inputClassName,
}: ChatSearchFieldProps): React.JSX.Element {
  return (
    <InputGroup className={className}>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn('[--input-padding-x:0.5rem]', inputClassName)}
      />
      {searching ? (
        <InputGroupAddon align="inline-end" className="pointer-events-none">
          <Spinner className="size-3.5" />
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}
