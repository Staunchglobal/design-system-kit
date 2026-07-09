'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function RadioGroupDemo() {
  return (
    <ComponentSection
        id="radio-group"
        title="Radio Group"
        description="A set of mutually exclusive radio options."
      >
        <Example title="Default selection">
          <RadioGroup defaultValue="comfortable" className="gap-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-default" value="default" />
              <Label htmlFor="radio-default">Default</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-comfortable" value="comfortable" />
              <Label htmlFor="radio-comfortable">Comfortable</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-compact" value="compact" />
              <Label htmlFor="radio-compact">Compact</Label>
            </div>
          </RadioGroup>
        </Example>

        <Example title="With disabled option">
          <RadioGroup defaultValue="standard" className="gap-3">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-standard" value="standard" />
              <Label htmlFor="radio-standard">Standard shipping</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="radio-express" value="express" disabled />
              <Label htmlFor="radio-express">Express shipping (unavailable)</Label>
            </div>
          </RadioGroup>
        </Example>
      </ComponentSection>
  )
}
