'use client'

import * as React from 'react'
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/icons/icon'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-card dark:bg-neutral-900 w-full max-w-[400px] rounded-lg border border-border p-0 shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)] [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:border-none in-data-[slot=card-content]:bg-transparent in-data-[slot=card-content]:rounded-none in-data-[slot=card-content]:shadow-none in-data-[slot=popover-content]:border-none in-data-[slot=popover-content]:bg-transparent in-data-[slot=popover-content]:rounded-none in-data-[slot=popover-content]:shadow-none',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn('relative flex flex-col gap-0 md:flex-row', defaultClassNames.months),
        month: cn('flex w-full flex-col gap-0', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between p-3',
          defaultClassNames.nav
        ),
        button_previous: cn(
          'size-9 p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          'size-9 p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'relative flex h-auto w-full items-center justify-center border-b border-border p-3',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn('relative rounded-(--cell-radius)', defaultClassNames.dropdown_root),
        dropdown: cn('absolute inset-0 bg-popover opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'font-semibold select-none text-foreground',
          captionLayout === 'label'
            ? 'text-base'
            : 'flex items-center gap-1 rounded-(--cell-radius) text-base [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label
        ),
        month_grid: cn('w-full border-collapse px-3 pt-2 pb-3', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 rounded-(--cell-radius) text-sm font-medium text-muted-foreground normal-case select-none',
          defaultClassNames.weekday
        ),
        week: cn('mt-3 flex w-full', defaultClassNames.week),
        week_number_header: cn('w-(--cell-size) select-none', defaultClassNames.week_number_header),
        week_number: cn(
          'text-[0.8rem] text-muted-foreground select-none',
          defaultClassNames.week_number
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full p-0.5 rounded-(--cell-radius) text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)'
            : '[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
          defaultClassNames.day
        ),
        range_start: cn(
          'relative isolate z-0 rounded-(--cell-radius)',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-(--cell-radius)', defaultClassNames.range_middle),
        range_end: cn(
          'relative isolate z-0 rounded-(--cell-radius)',
          defaultClassNames.range_end
        ),
        today: cn('bg-transparent', defaultClassNames.today),
        outside: cn(
          'text-neutral-500 aria-selected:text-neutral-500',
          defaultClassNames.outside
        ),
        disabled: cn(defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <AppIcon name="calendar.previous" className={cn('size-4', className)} {...props} />
            )
          }

          if (orientation === 'right') {
            return <AppIcon name="calendar.next" className={cn('size-4', className)} {...props} />
          }

          return <AppIcon name="calendar.chevron" className={cn('size-4', className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        PreviousMonthButton: ({ className, ...props }) => (
          <Button
            variant={buttonVariant}
            size="icon-sm"
            data-ui="calendar-nav-previous"
            className={cn(
              'text-muted-foreground hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100',
              className
            )}
            {...props}
          />
        ),
        NextMonthButton: ({ className, ...props }) => (
          <Button
            variant={buttonVariant}
            size="icon-sm"
            data-ui="calendar-nav-next"
            className={cn(
              'text-muted-foreground hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100',
              className
            )}
            {...props}
          />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  children,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const showTodayDot = modifiers.today && !modifiers.outside

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-outside={modifiers.outside || undefined}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'group-data-[focused=true]/day:border-primary-500 group-data-[focused=true]/day:ring-primary-500/45',
        'hover:bg-neutral-100 active:bg-neutral-200',
        'data-[outside=true]:pointer-events-none data-[outside=true]:text-neutral-500! data-[outside=true]:hover:bg-transparent! data-[outside=true]:active:bg-transparent!',
        'disabled:pointer-events-none disabled:bg-neutral-200 disabled:text-neutral-500 disabled:opacity-100',
        'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:font-semibold data-[range-end=true]:hover:bg-primary! data-[range-end=true]:active:bg-primary-700!',
        'data-[range-middle=true]:bg-primary-50 data-[range-middle=true]:text-foreground data-[range-middle=true]:hover:bg-primary-50!',
        'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:font-semibold data-[range-start=true]:hover:bg-primary! data-[range-start=true]:active:bg-primary-700!',
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:font-semibold data-[selected-single=true]:hover:bg-primary! data-[selected-single=true]:active:bg-primary-700!',
        'dark:hover:text-foreground relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 text-sm text-foreground font-normal',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]',
        'data-[range-end=true]:rounded-(--cell-radius) data-[range-middle=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-(--cell-radius) data-[selected-single=true]:rounded-(--cell-radius)',
        '[&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      {children}
      {showTodayDot ? (
        <span
          aria-hidden="true"
          data-slot="calendar-today-dot"
          className={cn(
            'pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full',
            modifiers.selected ? 'bg-primary-foreground' : 'bg-primary'
          )}
        />
      ) : null}
    </Button>
  )
}

export { Calendar, CalendarDayButton }
