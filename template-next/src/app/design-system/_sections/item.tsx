'use client'

import * as React from 'react'
import { Bell, CreditCard, ShieldCheck, Trash2, User } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/item'
import { Switch } from '@/components/ui/switch'

export default function ItemDemo() {
  const [notifications, setNotifications] = React.useState(true)
  const [autoRenew, setAutoRenew] = React.useState(false)
  return (
    <ComponentSection
        id="item"
        title="Item"
        description="A flexible row layout for lists, settings, and media content."
      >
        <Example
          title="Settings list"
          description="Outline and muted variants inside an ItemGroup."
          contentClassName="block"
        >
          <ItemGroup className="mx-auto max-w-md">
            <Item variant="outline">
              <ItemMedia variant="icon">
                <Bell />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Notifications</ItemTitle>
                <ItemDescription>Receive email updates about account activity.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline">
              <ItemMedia variant="icon">
                <CreditCard />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Auto-renew subscription</ItemTitle>
                <ItemDescription>
                  Automatically charge your card each billing cycle.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="muted">
              <ItemMedia variant="icon">
                <ShieldCheck />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Two-factor authentication</ItemTitle>
                <ItemDescription>Add an extra layer of security to your account.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </Example>

        <Example
          title="Sizes"
          description="Default, sm, and xs item sizes."
          contentClassName="block"
        >
          <ItemGroup className="mx-auto max-w-md">
            <Item variant="outline" size="default">
              <ItemMedia variant="icon">
                <User />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Default size</ItemTitle>
                <ItemDescription>Standard row height and spacing.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="icon-sm" variant="ghost" aria-label="Remove">
                  <Trash2 />
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="sm">
              <ItemMedia variant="icon">
                <User />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Small size</ItemTitle>
                <ItemDescription>Slightly tighter than default.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="icon-sm" variant="ghost" aria-label="Remove">
                  <Trash2 />
                </Button>
              </ItemActions>
            </Item>
            <ItemSeparator />
            <Item variant="outline" size="xs">
              <ItemMedia variant="icon">
                <User />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Extra small size</ItemTitle>
                <ItemDescription>Compact row for dense lists.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button size="icon-xs" variant="ghost" aria-label="Remove">
                  <Trash2 />
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        </Example>
      </ComponentSection>
  )
}
