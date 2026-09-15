'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DatePickerProps = {
  value?: Date
  onValueChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  formatStr?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  disabled = false,
  formatStr = 'PPP',
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-slot="date-picker"
          data-empty={!value}
          className={cn(
            'h-12 w-56 justify-between gap-2 rounded-lg border-border bg-card px-3 text-sm font-normal text-foreground hover:bg-card hover:border-neutral-300 active:bg-card active:border-neutral-300 aria-expanded:bg-card aria-expanded:border-primary-500 disabled:border-border disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100 data-[empty=true]:text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {value ? format(value, formatStr) : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden rounded-lg border border-border bg-card p-0 shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)] ring-0"
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onValueChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true
            if (maxDate && date > maxDate) return true
            return false
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
