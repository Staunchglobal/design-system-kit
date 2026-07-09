import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export default function AspectRatioDemo() {
  return (
    <ComponentSection
        id="aspect-ratio"
        title="Aspect Ratio"
        description="Constrains content to a specific width/height ratio."
      >
        <ExampleGrid>
          <Example title="16 / 9" contentClassName="block">
            <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden rounded-md">
              <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                16:9
              </div>
            </AspectRatio>
          </Example>
          <Example title="1 / 1" contentClassName="block">
            <AspectRatio ratio={1} className="bg-muted w-40 overflow-hidden rounded-md">
              <div className="text-muted-foreground flex size-full items-center justify-center text-sm">
                1:1
              </div>
            </AspectRatio>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
