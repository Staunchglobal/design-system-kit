import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

export default function KbdDemo() {
  return (
    <ComponentSection
        id="kbd"
        title="Kbd"
        description="Represents keyboard input or keyboard shortcuts."
      >
        <Example title="Single keys">
          <Kbd>Esc</Kbd>
          <Kbd>Enter</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>Shift</Kbd>
        </Example>

        <Example title="Shortcut combos">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>Shift</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </Example>
      </ComponentSection>
  )
}
