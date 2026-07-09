'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider, MessageScrollerViewport } from '@/components/ui/message-scroller'

export default function MessageScrollerDemo() {
  return (
    <ComponentSection
        id="message-scroller"
        title="Message Scroller"
        description="Auto-scrolling viewport for chat transcripts with a jump-to-latest control."
      >
        <Example title="Auto-scrolling list" contentClassName="block">
          <MessageScrollerProvider autoScroll defaultScrollPosition="end">
            <MessageScroller className="h-64 w-full rounded-lg border">
              <MessageScrollerViewport>
                <MessageScrollerContent className="p-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <MessageScrollerItem key={index}>
                      <div className="bg-muted w-fit max-w-[80%] rounded-xl px-3 py-2 text-sm">
                        Message {index + 1}
                      </div>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton direction="end" />
            </MessageScroller>
          </MessageScrollerProvider>
        </Example>
      </ComponentSection>
  )
}
