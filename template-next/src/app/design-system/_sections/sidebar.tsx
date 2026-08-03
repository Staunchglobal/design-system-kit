'use client'

import { HomeIcon, InboxIcon, LayoutDashboardIcon, PlusIcon, SettingsIcon, UserIcon, UsersIcon } from 'lucide-react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from '@/components/ui/sidebar'

export default function SidebarDemo() {
  return (
    <ComponentSection
        id="sidebar"
        title="Sidebar"
        description="Collapsible application shell with a header, grouped navigation, and a footer."
      >
        <Example
          title="App shell"
          description="Toggle the panel-left control to collapse the sidebar to icons."
          contentClassName="p-0"
        >
          <div data-sidebar-demo className="h-[420px] w-full overflow-hidden rounded-lg border">
            <SidebarProvider className="h-full min-h-0">
              <Sidebar collapsible="icon">
                <SidebarHeader>
                  <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                    <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-md">
                      <LayoutDashboardIcon className="size-3.5" />
                    </div>
                    <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                      Acme Inc
                    </span>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupAction aria-label="Add workspace">
                      <PlusIcon />
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton isActive tooltip="Dashboard">
                            <HomeIcon />
                            <span>Dashboard</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Inbox">
                            <InboxIcon />
                            <span>Inbox</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>12</SidebarMenuBadge>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Team">
                            <UsersIcon />
                            <span>Team</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton tooltip="Settings">
                            <SettingsIcon />
                            <span>Settings</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarSeparator />
                <SidebarFooter>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Jane Doe">
                        <UserIcon />
                        <span>Jane Doe</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarFooter>
              </Sidebar>
              <SidebarInset className="min-h-0">
                <div className="flex items-center gap-2 border-b p-3">
                  <SidebarTrigger />
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="bg-muted h-20 rounded-lg" />
                  <div className="bg-muted h-20 rounded-lg" />
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </Example>
      </ComponentSection>
  )
}
