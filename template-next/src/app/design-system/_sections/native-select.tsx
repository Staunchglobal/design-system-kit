'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select'

export default function NativeSelectDemo() {
  return (
    <ComponentSection
        id="native-select"
        title="Native Select"
        description="A styled wrapper around the native browser <select> element."
      >
        <Example title="Default">
          <NativeSelect defaultValue="banana">
            <NativeSelectOption value="apple">Apple</NativeSelectOption>
            <NativeSelectOption value="banana">Banana</NativeSelectOption>
            <NativeSelectOption value="orange">Orange</NativeSelectOption>
          </NativeSelect>
        </Example>

        <Example title="Disabled">
          <NativeSelect disabled defaultValue="apple">
            <NativeSelectOption value="apple">Apple</NativeSelectOption>
            <NativeSelectOption value="banana">Banana</NativeSelectOption>
          </NativeSelect>
        </Example>

        <Example title="Option groups">
          <NativeSelect defaultValue="carrot">
            <NativeSelectOptGroup label="Fruits">
              <NativeSelectOption value="apple">Apple</NativeSelectOption>
              <NativeSelectOption value="banana">Banana</NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="Vegetables">
              <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
              <NativeSelectOption value="potato">Potato</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
        </Example>
      </ComponentSection>
  )
}
