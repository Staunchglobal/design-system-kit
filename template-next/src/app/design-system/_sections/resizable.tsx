'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function ResizableDemo() {
  return (
    <ComponentSection
        id="resizable"
        title="Resizable"
        description="Panel group with a draggable handle for splitting layout regions."
      >
        <Example title="Horizontal panels">
          <ResizablePanelGroup orientation="horizontal" className="h-48 rounded-lg border">
            <ResizablePanel defaultSize={50}>
              <div className="text-muted-foreground flex h-full items-center justify-center p-4 text-sm">
                Panel one
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="text-muted-foreground flex h-full items-center justify-center p-4 text-sm">
                Panel two
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Example>
      </ComponentSection>
  )
}
