'use client'

import * as React from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { generateTimeOptions } from '@/components/time-range-picker/generate-time-options'
import {
  findOverlappingRanges,
  type TimeRange,
} from '@/components/time-range-picker/validate-ranges'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

type DayAvailability = {
  day: DayKey
  enabled: boolean
  ranges: TimeRange[]
}

const DEFAULT_LABELS: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

type TimeRangePickerProps = {
  value: DayAvailability[]
  onChange: (value: DayAvailability[]) => void
  stepMinutes?: number
  dayLabels?: Partial<Record<DayKey, string>>
  className?: string
}

function TimeRangePicker({
  value,
  onChange,
  stepMinutes = 30,
  dayLabels,
  className,
}: TimeRangePickerProps) {
  const options = React.useMemo(() => generateTimeOptions(stepMinutes), [stepMinutes])
  const labels = { ...DEFAULT_LABELS, ...dayLabels }

  function updateDay(day: DayKey, patch: Partial<DayAvailability>) {
    onChange(value.map((d) => (d.day === day ? { ...d, ...patch } : d)))
  }

  function updateRange(day: DayKey, index: number, patch: Partial<TimeRange>) {
    onChange(
      value.map((d) => {
        if (d.day !== day) return d
        const ranges = d.ranges.map((r, i) => (i === index ? { ...r, ...patch } : r))
        return { ...d, ranges }
      })
    )
  }

  function addRange(day: DayKey) {
    onChange(
      value.map((d) =>
        d.day === day
          ? { ...d, ranges: [...d.ranges, { start: '09:00', end: '17:00' }] }
          : d
      )
    )
  }

  function removeRange(day: DayKey, index: number) {
    onChange(
      value.map((d) =>
        d.day === day ? { ...d, ranges: d.ranges.filter((_, i) => i !== index) } : d
      )
    )
  }

  return (
    <div data-slot="time-range-picker" className={cn('flex flex-col gap-4', className)}>
      {value.map((day) => {
        const overlaps = findOverlappingRanges(day.ranges)
        const overlapSet = new Set(overlaps.flat())

        return (
          <div
            key={day.day}
            data-slot="time-range-day"
            className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium">{labels[day.day]}</label>
              <Switch
                checked={day.enabled}
                onCheckedChange={(enabled) => updateDay(day.day, { enabled })}
                aria-label={`Enable ${labels[day.day]}`}
              />
            </div>

            {day.enabled ? (
              <div className="flex flex-col gap-2">
                {day.ranges.map((range, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <Select
                      value={range.start}
                      onValueChange={(start) => updateRange(day.day, index, { start })}
                    >
                      <SelectTrigger
                        size="sm"
                        className={cn(overlapSet.has(index) && 'border-destructive')}
                        aria-label={`${labels[day.day]} start`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-muted-foreground text-xs">to</span>
                    <Select
                      value={range.end}
                      onValueChange={(end) => updateRange(day.day, index, { end })}
                    >
                      <SelectTrigger
                        size="sm"
                        className={cn(overlapSet.has(index) && 'border-destructive')}
                        aria-label={`${labels[day.day]} end`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove range"
                      onClick={() => removeRange(day.day, index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                {overlaps.length > 0 ? (
                  <p className="text-destructive text-xs">Overlapping time ranges</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => addRange(day.day)}
                >
                  <Plus className="size-3.5" />
                  Add range
                </Button>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export { TimeRangePicker, DEFAULT_LABELS }
export type { TimeRangePickerProps, DayAvailability, DayKey, TimeRange }
