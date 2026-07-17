'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { PhoneInput } from '@/components/ui/phone-input'

export default function PhoneInputDemo() {
  const [value, setValue] = React.useState('')
  return (
    <ComponentSection
      id="phone-input"
      title="Phone Input"
      description="Masked phone field with a configurable pattern (zero-dependency)."
    >
      <Example title="AU default pattern" contentClassName="block w-72">
        <PhoneInput label="Mobile" value={value} onChange={setValue} />
      </Example>
    </ComponentSection>
  )
}
