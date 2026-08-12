'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type TagInputProps = {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxTags?: number
  validate?: (tag: string) => boolean | string
  className?: string
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function TagInput({
  value,
  onValueChange,
  placeholder = 'Add tag…',
  disabled = false,
  maxTags,
  validate,
  className,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const errorId = React.useId()

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    if (value.includes(tag)) {
      setError('Tag already added')
      return
    }
    if (maxTags != null && value.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`)
      return
    }
    if (validate) {
      const result = validate(tag)
      if (result !== true) {
        setError(typeof result === 'string' ? result : 'Invalid tag')
        return
      }
    }
    setError(null)
    onValueChange([...value, tag])
    setInputValue('')
  }

  function removeTag(tag: string) {
    setError(null)
    onValueChange(value.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1]!)
    } else {
      setError(null)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (next.endsWith(',')) {
      addTag(next.slice(0, -1))
    } else {
      setInputValue(next)
    }
  }

  const atMax = maxTags != null && value.length >= maxTags

  return (
    <div
      data-slot="tag-input"
      className={cn(
        'flex min-h-8 flex-wrap items-center gap-1 border bg-transparent text-sm transition-colors',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge key={tag} data-slot="tag-chip" variant="secondary">
          <span data-slot="tag-chip-label">{tag}</span>
          <button
            type="button"
            data-slot="tag-chip-remove"
            aria-label={`Remove ${tag}`}
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            tabIndex={-1}
          >
            <X aria-hidden className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        id={id}
        name={name}
        data-slot="tag-input-field"
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled || atMax}
        aria-label={ariaLabel ?? 'Tag input'}
        aria-describedby={
          [error ? errorId : null, ariaDescribedby].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={ariaInvalid ?? (error ? true : undefined)}
        className="placeholder:text-muted-foreground min-w-16 flex-1 border-0 bg-transparent shadow-none outline-none ring-0 disabled:cursor-not-allowed"
      />
      {error && (
        <p id={errorId} data-slot="tag-input-error" className="basis-full text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

export { TagInput }
export type { TagInputProps }
