'use client'

import { Inbox, SearchX } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export default function EmptyDemo() {
  return (
    <ComponentSection
        id="empty"
        title="Empty"
        description="A placeholder for empty states, with optional media, title, description, and actions."
      >
        <ExampleGrid>
          <Example title="Default media" contentClassName="block">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="default">
                  <Inbox className="text-muted-foreground size-10" />
                </EmptyMedia>
                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>
                  When you receive messages, they will show up here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm">Compose message</Button>
              </EmptyContent>
            </Empty>
          </Example>
          <Example title="Icon media" contentClassName="block">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>No results found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your search or filters to find what you are looking for.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" variant="outline">
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
