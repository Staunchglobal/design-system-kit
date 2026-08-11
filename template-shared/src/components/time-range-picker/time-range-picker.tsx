'use client'

import * as React from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppIcon } from '@/components/icons/icon'
import { Switch } from '@/components/ui/switch'
import { generateTimeOptions } from '@/components/time-range-picker/generate-time-options'
import {
  findOverlappingRanges,
  toMinutes,
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

type TimeOption = { label: string; value: string }

type TimeSelectProps = {
  value: string
  options: TimeOption[]
  /** Used for the trigger label when `value` is filtered out of `options`. */
  labelOptions?: TimeOption[]
  onValueChange: (value: string) => void
  'aria-label': string
  invalid?: boolean
}

function TimeSelect({
  value,
  options,
  labelOptions,
  onValueChange,
  'aria-label': ariaLabel,
  invalid = false,
}: TimeSelectProps) {
  const [open, setOpen] = React.useState(false)
  const label =
    (labelOptions ?? options).find((opt) => opt.value === value)?.label ?? value

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-slot="time-range-select-trigger"
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          className={cn(
            'min-w-28 justify-between font-normal',
            invalid && 'border-destructive'
          )}
        >
          <span className="truncate">{label}</span>
          <AppIcon
            name="select.chevron"
            className="text-muted-foreground size-4 shrink-0 opacity-70"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="time-range-select-content"
        align="start"
        className="max-h-60 min-w-(--radix-dropdown-menu-trigger-width) overflow-y-auto overscroll-contain"
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            data-slot="time-range-select-item"
            className={cn(
              'cursor-pointer',
              opt.value === value && 'bg-accent text-accent-foreground'
            )}
            onSelect={() => {
              onValueChange(opt.value)
              setOpen(false)
            }}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type TimeRangePickerProps = {
  value: DayAvailability[]
  onChange: (value: DayAvailability[]) => void
  stepMinutes?: number
  dayLabels?: Partial<Record<DayKey, string>>
  className?: string
}

function nextOptionAfter(options: TimeOption[], hhmm: string): string | undefined {
  const minutes = toMinutes(hhmm)
  return options.find((opt) => toMinutes(opt.value) > minutes)?.value
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

  function setStart(day: DayKey, index: number, start: string) {
    const current = value.find((d) => d.day === day)?.ranges[index]
    if (!current) return
    let end = current.end
    if (toMinutes(start) >= toMinutes(end)) {
      const next = nextOptionAfter(options, start)
      if (!next) return
      end = next
    }
    updateRange(day, index, { start, end })
  }

  function setEnd(day: DayKey, index: number, end: string) {
    const current = value.find((d) => d.day === day)?.ranges[index]
    if (!current) return
    if (toMinutes(end) <= toMinutes(current.start)) return
    updateRange(day, index, { end })
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
                {day.ranges.map((range, index) => {
                  // Index as key is deliberate, not an oversight: `TimeRange` has no stable id, and
                  // `updateRange` creates a fresh object for the edited row on every change, so a
                  // reference/generated-id key would remount (and drop focus on) whichever control the
                  // user is actively using. Safe only because every row is fully controlled from
                  // `range`/`index` props with no per-row local/uncontrolled state — revisit this if
                  // that ever changes (e.g. drag-to-reorder, per-row animation).
                  const startOptions = options.filter(
                    (opt) => toMinutes(opt.value) < toMinutes(range.end)
                  )
                  const endOptions = options.filter(
                    (opt) => toMinutes(opt.value) > toMinutes(range.start)
                  )
                  const invalid =
                    overlapSet.has(index) || toMinutes(range.start) >= toMinutes(range.end)

                  return (
                    <div
                      key={index}
                      data-slot="time-range-row"
                      className="flex flex-nowrap items-center gap-2"
                    >
                      <TimeSelect
                        value={range.start}
                        options={startOptions}
                        labelOptions={options}
                        onValueChange={(start) => setStart(day.day, index, start)}
                        aria-label={`${labels[day.day]} start`}
                        invalid={invalid}
                      />
                      <span className="text-muted-foreground shrink-0 text-xs">to</span>
                      <TimeSelect
                        value={range.end}
                        options={endOptions}
                        labelOptions={options}
                        onValueChange={(end) => setEnd(day.day, index, end)}
                        aria-label={`${labels[day.day]} end`}
                        invalid={invalid}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        data-slot="time-range-remove"
                        className="cursor-pointer"
                        aria-label="Remove range"
                        onClick={() => removeRange(day.day, index)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  )
                })}
                {overlaps.length > 0 ? (
                  <p className="text-destructive text-xs">Overlapping time ranges</p>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit cursor-pointer"
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
