'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@/components/ui/bubble'

export default function BubbleDemo() {
  return (
    <ComponentSection
        id="bubble"
        title="Bubble"
        description="Chat message bubbles with alignment, variants, and reactions."
      >
        <Example
          title="Conversation"
          description="Alternating alignment across all bubble variants."
        >
          <BubbleGroup className="w-full max-w-md">
            <Bubble align="start" variant="muted">
              <BubbleContent>Hey, can you review the PR when you get a chance?</BubbleContent>
            </Bubble>
            <Bubble align="end" variant="default">
              <BubbleContent>Sure thing, looking now.</BubbleContent>
              <BubbleReactions side="bottom" align="end">
                👍
              </BubbleReactions>
            </Bubble>
            <Bubble align="start" variant="outline">
              <BubbleContent>Thanks! Left two small comments.</BubbleContent>
            </Bubble>
            <Bubble align="end" variant="tinted">
              <BubbleContent>Got it, fixing now.</BubbleContent>
            </Bubble>
            <Bubble align="start" variant="secondary">
              <BubbleContent>No rush, take your time.</BubbleContent>
            </Bubble>
            <Bubble align="end" variant="ghost">
              <BubbleContent>Appreciate it.</BubbleContent>
            </Bubble>
            <Bubble align="start" variant="destructive">
              <BubbleContent>Heads up, this broke the build.</BubbleContent>
            </Bubble>
          </BubbleGroup>
        </Example>
      </ComponentSection>
  )
}
