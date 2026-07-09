import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function SwitchDemo() {
  return (
    <ComponentSection
        id="switch"
        title="Switch"
        description="A toggle control for an on/off state."
      >
        <Example title="Off">
          <div className="flex items-center gap-2">
            <Switch id="switch-off" />
            <Label htmlFor="switch-off">Notifications</Label>
          </div>
        </Example>

        <Example title="On">
          <div className="flex items-center gap-2">
            <Switch id="switch-on" defaultChecked />
            <Label htmlFor="switch-on">Notifications</Label>
          </div>
        </Example>

        <Example title="Disabled">
          <div className="flex items-center gap-2">
            <Switch id="switch-disabled" disabled />
            <Label htmlFor="switch-disabled">Notifications</Label>
          </div>
        </Example>

        <Example title="Disabled checked">
          <div className="flex items-center gap-2">
            <Switch id="switch-disabled-checked" disabled defaultChecked />
            <Label htmlFor="switch-disabled-checked">Notifications</Label>
          </div>
        </Example>
      </ComponentSection>
  )
}
