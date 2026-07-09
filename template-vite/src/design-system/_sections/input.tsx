import { SearchIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Input } from '@/components/ui/input'

export default function InputDemo() {
  return (
    <ComponentSection
        id="input"
        title="Input"
        description="Single-line text field for user input."
      >
        <Example title="Default">
          <Input placeholder="Email address" />
        </Example>

        <Example title="Disabled">
          <Input disabled placeholder="Disabled input" />
        </Example>

        <Example title="Invalid" description="Styled via aria-invalid.">
          <Input aria-invalid defaultValue="not-an-email" />
        </Example>

        <Example title="File input">
          <Input type="file" />
        </Example>

        <Example title="With leading icon">
          <div className="relative w-64">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input className="pl-8" placeholder="Search..." />
          </div>
        </Example>
      </ComponentSection>
  )
}
