import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Slider } from '@/components/ui/slider'

export default function SliderDemo() {
  return (
    <ComponentSection
        id="slider"
        title="Slider"
        description="A control for selecting a value or range from within a range."
      >
        <Example title="Single value" contentClassName="flex-col items-stretch">
          <Slider defaultValue={[50]} className="w-64" />
        </Example>

        <Example
          title="Range"
          description="Two thumbs via an array default value."
          contentClassName="flex-col items-stretch"
        >
          <Slider defaultValue={[25, 75]} className="w-64" />
        </Example>

        <Example title="Disabled" contentClassName="flex-col items-stretch">
          <Slider defaultValue={[40]} disabled className="w-64" />
        </Example>
      </ComponentSection>
  )
}
