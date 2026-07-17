import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { DatePicker } from '@/components/ui/date-picker'

export default function DatePickerSectionDemo() {
  const [date, setDate] = React.useState<Date | undefined>()
  return (
    <ComponentSection
      id="date-picker"
      title="Date Picker"
      description="Popover + Calendar field for picking a single date."
    >
      <Example title="Single date">
        <DatePicker value={date} onValueChange={setDate} />
      </Example>
    </ComponentSection>
  )
}
