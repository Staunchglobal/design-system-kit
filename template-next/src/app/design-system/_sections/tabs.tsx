'use client'

import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function TabsDemo() {
  return (
    <ComponentSection
        id="tabs"
        title="Tabs"
        description="Switch between related views, in default and line variants."
      >
        <ExampleGrid>
          <Example title="Default variant" contentClassName="block">
            <Tabs defaultValue="account" className="w-full">
              <TabsList variant="default">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              <TabsContent value="account">Update your name and email address.</TabsContent>
              <TabsContent value="password">Change your password and manage 2FA.</TabsContent>
              <TabsContent value="team">Invite and manage team members.</TabsContent>
            </Tabs>
          </Example>
          <Example title="Line variant" contentClassName="block">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList variant="line">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                A summary of recent activity and key metrics.
              </TabsContent>
              <TabsContent value="analytics">Charts and trends over the last 30 days.</TabsContent>
              <TabsContent value="settings">Configure preferences for this workspace.</TabsContent>
            </Tabs>
          </Example>
        </ExampleGrid>
      </ComponentSection>
  )
}
