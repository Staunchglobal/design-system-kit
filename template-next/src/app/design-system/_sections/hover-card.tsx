'use client'

import { Calendar } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

function HoverCardSection() {
  return (
    <Example title="User profile hover card" description="Hover the username to preview">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="px-0">
            @shadcn
          </Button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@shadcn</h4>
              <p className="text-muted-foreground text-sm">Building UI components for the web.</p>
              <div className="text-muted-foreground flex items-center gap-1 pt-1 text-xs">
                <Calendar className="size-3.5" />
                Joined December 2021
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </Example>
  )
}

export default function HoverCardDemo() {
  return (
    <ComponentSection
        id="hover-card"
        title="Hover Card"
        description="Preview content shown when hovering a trigger."
      >
        <HoverCardSection />
      </ComponentSection>
  )
}
