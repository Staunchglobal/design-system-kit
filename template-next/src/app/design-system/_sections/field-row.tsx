'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { FieldRow, FieldRowGroup } from '@/components/ui/field-row'
import { Switch } from '@/components/ui/switch'

export default function FieldRowDemo() {
  const [notifications, setNotifications] = React.useState(true)

  return (
    <ComponentSection
      id="field-row"
      title="Field Row"
      description="iOS-settings-style editable rows — the interactive counterpart to Info Row."
    >
      <Example title="Grouped settings" contentClassName="block w-full max-w-md">
        <FieldRowGroup title="Account">
          <FieldRow label="Name" value="Ada Lovelace" showChevron onPress={() => {}} />
          <FieldRow label="Email" value="ada@example.com" showChevron onPress={() => {}} />
          <FieldRow label="Notifications" editable={false}>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
              aria-label="Notifications"
            />
          </FieldRow>
        </FieldRowGroup>
      </Example>
    </ComponentSection>
  )
}
