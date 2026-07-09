import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Calendar } from '@/components/ui/calendar'

export default function CalendarDemo() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(() => {
    const from = new Date()
    const to = new Date(from)
    to.setDate(to.getDate() + 6)
    return { from, to }
  })
  return (
    <ComponentSection
        id="calendar"
        title="Calendar"
        description="A date field component built on react-day-picker, for single dates or ranges."
      >
        <ExampleGrid>
          <Example title="Single date" contentClassName="block">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto rounded-lg border"
            />
          </Example>
          <Example title="Date range" contentClassName="block">
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={setSelectedRange}
              numberOfMonths={1}
              className="mx-auto rounded-lg border"
            />
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
