import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { PhoneInput } from '@/components/ui/phone-input'

export default function PhoneInputDemo() {
  const [us, setUs] = React.useState('')
  const [au, setAu] = React.useState('')
  return (
    <ComponentSection
      id="phone-input"
      title="Phone Input"
      description="Masked phone field with a configurable pattern (zero-dependency). Defaults to US."
    >
      <Example title="US default" contentClassName="block w-72">
        <PhoneInput label="Mobile" value={us} onChange={setUs} />
      </Example>

      <Example
        title="Custom pattern (AU)"
        description="Pass pattern to override the US default."
        contentClassName="block w-72"
      >
        <PhoneInput
          label="Mobile"
          pattern="+61#########"
          value={au}
          onChange={setAu}
        />
      </Example>
    </ComponentSection>
  )
}
