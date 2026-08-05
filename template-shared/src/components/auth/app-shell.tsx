'use client'

import * as React from 'react'
import { LogOutIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export type AppShellNavItem = {
  label: string
  href: string
  icon?: React.ReactNode
}

export type AppShellLinkProps = {
  href: string
  className?: string
  children: React.ReactNode
}

export type AppShellProps = {
  navItems: AppShellNavItem[]
  /** The current path, e.g. `useLocation().pathname` (Vite) or `usePathname()` (Next) — used only to highlight the active item. */
  activeHref: string
  userEmail?: string
  onLogout: () => void
  children: React.ReactNode
  /** Each framework supplies its own client-side link (react-router's `Link` or next/link) so sidebar navigation never triggers a full page reload. */
  renderLink: (props: AppShellLinkProps) => React.ReactNode
}

/**
 * The signed-in app shell — sidebar + content area. Shared verbatim between
 * Next and Vite; the one framework-specific piece (client-side navigation)
 * is injected via `renderLink` rather than hardcoded to either router.
 */
export function AppShell({ navItems, activeHref, userEmail, onLogout, children, renderLink }: AppShellProps) {
  return (
    <SidebarProvider className="h-dvh min-h-0">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            {/* Same PanelLeft mark already in the header — click collapses to icons on desktop. */}
            <SidebarTrigger
              className={cn(
                'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
                'size-6 rounded-md [&_svg]:size-3.5'
              )}
            />
            <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">App</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeHref === item.href || activeHref.startsWith(`${item.href}/`)}
                      tooltip={item.label}
                      className="[&_svg]:size-3.5"
                    >
                      {renderLink({
                        href: item.href,
                        children: (
                          <>
                            {item.icon}
                            <span>{item.label}</span>
                          </>
                        ),
                      })}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {userEmail ? (
              <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
                <SidebarMenuButton disabled className="cursor-default opacity-100">
                  <span className="truncate">{userEmail}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onLogout} tooltip="Log out">
                <LogOutIcon />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className={cn('flex items-center gap-2 border-b px-3 py-2 md:hidden')}>
          <SidebarTrigger />
        </div>
        <div
          className="scrollbar-gutter-stable min-h-0 flex-1 overflow-y-auto [overflow-anchor:none]"
          data-slot="app-content-scroll"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
