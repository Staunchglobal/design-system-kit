'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LabelDemo() {
  return (
    <ComponentSection
        id="label"
        title="Label"
        description="An accessible label for form controls."
      >
        <Example title="Paired with input">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label-email">Email</Label>
            <Input id="label-email" placeholder="you@example.com" />
          </div>
        </Example>

        <Example
          title="Disabled via peer"
          description="Label dims through peer-disabled when the sibling input is disabled."
        >
          <div className="flex items-center gap-2">
            <Input id="label-peer" disabled className="peer w-auto" defaultValue="Disabled" />
            <Label htmlFor="label-peer">Disabled field</Label>
          </div>
        </Example>

        <Example
          title="Disabled via group"
          description="Label dims through group-data-[disabled=true] on an ancestor."
        >
          <div className="group flex items-center gap-2" data-disabled="true">
            <Checkbox id="label-group" disabled />
            <Label htmlFor="label-group">Disabled group item</Label>
          </div>
        </Example>
      </ComponentSection>
  )
}
