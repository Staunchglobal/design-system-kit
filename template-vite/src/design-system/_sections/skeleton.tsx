import { ComponentSection, Example, ExampleGrid } from '@/design-system/_lib/showcase'
import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonDemo() {
  return (
    <ComponentSection
        id="skeleton"
        title="Skeleton"
        description="Used to show a placeholder while content is loading."
      >
        <ExampleGrid>
          <Example title="Text lines" contentClassName="flex-col items-start">
            <div className="w-full space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </Example>

          <Example
            title="Loading card"
            description="Avatar and text skeleton row."
            contentClassName="flex-col items-start"
          >
            <div className="flex w-full items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
