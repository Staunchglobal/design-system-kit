import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export default function CheckboxDemo() {
  return (
    <ComponentSection
        id="checkbox"
        title="Checkbox"
        description="A control for toggling a single boolean value, with support for an indeterminate state."
      >
        <Example title="Unchecked">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-unchecked" />
            <Label htmlFor="checkbox-unchecked">Accept terms</Label>
          </div>
        </Example>

        <Example title="Checked">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-checked" defaultChecked />
            <Label htmlFor="checkbox-checked">Accept terms</Label>
          </div>
        </Example>

        <Example title="Indeterminate">
          <div className="flex items-center gap-2">
            <Checkbox
              id="checkbox-indeterminate"
              checked="indeterminate"
              onCheckedChange={() => {}}
            />
            <Label htmlFor="checkbox-indeterminate">Select all</Label>
          </div>
        </Example>

        <Example title="Disabled">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-disabled" disabled />
            <Label htmlFor="checkbox-disabled">Accept terms</Label>
          </div>
        </Example>

        <Example title="Disabled checked">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-disabled-checked" disabled defaultChecked />
            <Label htmlFor="checkbox-disabled-checked">Accept terms</Label>
          </div>
        </Example>

        <Example title="Invalid" description="Styled via aria-invalid.">
          <div className="flex items-center gap-2">
            <Checkbox id="checkbox-invalid" aria-invalid />
            <Label htmlFor="checkbox-invalid">Accept terms</Label>
          </div>
        </Example>
      </ComponentSection>
  )
}
