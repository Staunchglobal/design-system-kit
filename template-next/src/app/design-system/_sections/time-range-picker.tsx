'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { TimeRangePicker, type DayAvailability } from '@/components/ui/time-range-picker'

const INITIAL: DayAvailability[] = [
  { day: 'mon', enabled: true, ranges: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '17:00' }] },
  { day: 'tue', enabled: true, ranges: [{ start: '09:00', end: '17:00' }] },
  { day: 'wed', enabled: false, ranges: [] },
  {
    day: 'thu',
    enabled: true,
    ranges: [{ start: '10:00', end: '16:00' }, { start: '15:00', end: '18:00' }],
  },
  { day: 'fri', enabled: true, ranges: [{ start: '09:00', end: '15:00' }] },
  { day: 'sat', enabled: false, ranges: [] },
  { day: 'sun', enabled: false, ranges: [] },
]

export default function TimeRangePickerDemo() {
  const [value, setValue] = React.useState(INITIAL)
  return (
    <ComponentSection
      id="time-range-picker"
      title="Time Range Picker"
      description="Per-weekday availability editor with overlap validation."
    >
      <Example title="Weekly availability" contentClassName="block w-full max-w-lg">
        <TimeRangePicker value={value} onChange={setValue} />
      </Example>
    </ComponentSection>
  )
}
