'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ScrollAreaDemo() {
  return (
    <ComponentSection
        id="scroll-area"
        title="Scroll Area"
        description="Custom scrollbar styling over a native overflow container."
      >
        <Example title="Vertical scroll">
          <ScrollArea className="h-48 w-full rounded-lg border">
            <div className="flex flex-col gap-px p-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm"
                >
                  Row {index + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Example>
      </ComponentSection>
  )
}
