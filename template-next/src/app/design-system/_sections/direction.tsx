'use client'

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { DirectionProvider } from '@/components/ui/direction'

export default function DirectionDemo() {
  return (
    <ComponentSection
        id="direction"
        title="Direction"
        description="Provides RTL/LTR context to direction-aware components."
      >
        <ExampleGrid>
          <Example title="Left to right">
            <DirectionProvider dir="ltr">
              <div dir="ltr" className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" aria-label="Previous">
                  <ArrowLeftIcon />
                </Button>
                <Button variant="outline" size="icon-sm" aria-label="Next">
                  <ArrowRightIcon />
                </Button>
                <span className="text-muted-foreground text-sm">Left to right</span>
              </div>
            </DirectionProvider>
          </Example>
          <Example title="Right to left">
            <DirectionProvider dir="rtl">
              <div dir="rtl" className="flex items-center gap-2">
                <Button variant="outline" size="icon-sm" aria-label="Previous">
                  <ArrowLeftIcon />
                </Button>
                <Button variant="outline" size="icon-sm" aria-label="Next">
                  <ArrowRightIcon />
                </Button>
                <span className="text-muted-foreground text-sm">Right to left</span>
              </div>
            </DirectionProvider>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
