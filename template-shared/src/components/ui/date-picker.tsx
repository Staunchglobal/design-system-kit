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
            'data-[empty=true]:text-muted-foreground w-56 justify-start text-left font-normal',
            className
          )}
        >
          <CalendarIcon />
          {value ? format(value, formatStr) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
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
