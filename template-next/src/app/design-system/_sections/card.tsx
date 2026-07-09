'use client'

import { PlusIcon } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from '@/components/ui/card'

export default function CardDemo() {
  return (
    <ComponentSection
        id="card"
        title="Card"
        description="Container for grouping related content and actions."
      >
        <ExampleGrid>
          <Example title="Basic card" contentClassName="p-0 block">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>Invite your teammates to collaborate.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  You currently have 4 members in this workspace.
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Invite</Button>
              </CardFooter>
            </Card>
          </Example>
          <Example title="With CardAction" contentClassName="p-0 block">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive alerts.</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon-sm" aria-label="Add notification rule">
                    <PlusIcon />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Email and push notifications are currently enabled.
                </p>
              </CardContent>
            </Card>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
