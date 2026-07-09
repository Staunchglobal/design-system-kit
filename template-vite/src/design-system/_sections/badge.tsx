import { BellIcon, ShieldCheckIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Badge } from '@/components/ui/badge'

export default function BadgeDemo() {
  return (
    <ComponentSection
        id="badge"
        title="Badge"
        description="Small status descriptors for UI elements."
      >
        <Example title="Variants">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
        </Example>
        <Example title="With icon">
          <Badge>
            <BellIcon data-icon="inline-start" />
            Alerts
          </Badge>
          <Badge variant="outline">
            <ShieldCheckIcon data-icon="inline-start" />
            Verified
          </Badge>
        </Example>
      </ComponentSection>
  )
}
