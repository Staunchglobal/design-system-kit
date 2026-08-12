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
        'flex min-h-12 flex-wrap items-center gap-1.5 rounded-2xl border border-input bg-neutral-0 px-4 py-1.5 text-base transition-colors focus-within:border-2 focus-within:border-primary has-[[aria-invalid=true]]:border-2 has-[[aria-invalid=true]]:border-destructive has-[[data-slot=tag-input-error]]:border-2 has-[[data-slot=tag-input-error]]:border-destructive has-[[data-slot=tag-input-field]:disabled]:bg-neutral-100 dark:bg-neutral-900 dark:has-[[data-slot=tag-input-field]:disabled]:bg-neutral-800',
        disabled && 'pointer-events-none cursor-not-allowed',
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          data-slot="tag-chip"
          variant="secondary"
          className="inline-flex h-6 max-w-full items-center gap-0.5 overflow-hidden rounded-md border border-border bg-neutral-0 ps-2 pe-1 py-0.5 text-sm/5 font-medium text-foreground dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <span
            data-slot="tag-chip-label"
            className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {tag}
          </span>
          <button
            type="button"
            data-slot="tag-chip-remove"
            aria-label={`Remove ${tag}`}
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            tabIndex={-1}
            className="inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent text-inherit leading-none opacity-45 outline-none hover:bg-neutral-100 hover:text-foreground hover:opacity-100 focus-visible:bg-neutral-100 focus-visible:text-foreground focus-visible:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 dark:focus-visible:bg-neutral-800 dark:focus-visible:text-neutral-50"
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
        className="placeholder:text-muted-400 min-w-16 flex-1 appearance-none rounded-none border-0 bg-transparent p-0 text-foreground shadow-none outline-none ring-0 disabled:cursor-not-allowed"
      />
      {error && (
        <p id={errorId} data-slot="tag-input-error" className="basis-full text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export { TagInput }
export type { TagInputProps }
