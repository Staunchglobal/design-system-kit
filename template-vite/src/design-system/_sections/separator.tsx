import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { Separator } from '@/components/ui/separator'

export default function SeparatorDemo() {
  return (
    <ComponentSection
        id="separator"
        title="Separator"
        description="Visually or semantically separates content."
      >
        <Example title="Horizontal" contentClassName="block">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Section one</h4>
              <p className="text-muted-foreground text-xs">Some descriptive text above the fold.</p>
            </div>
            <Separator orientation="horizontal" />
            <div>
              <h4 className="text-sm font-medium">Section two</h4>
              <p className="text-muted-foreground text-xs">More content follows below the line.</p>
            </div>
          </div>
        </Example>
        <Example title="Vertical" description="Used inline within a toolbar-like row">
          <div className="flex h-5 items-center gap-4 text-sm">
            <span>Blog</span>
            <Separator orientation="vertical" />
            <span>Docs</span>
            <Separator orientation="vertical" />
            <span>Source</span>
          </div>
        </Example>
      </ComponentSection>
  )
}
