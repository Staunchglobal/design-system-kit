'use client'

import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'

const navLinks = [
  { title: 'Overview', description: 'A quick summary of your workspace.' },
  { title: 'Analytics', description: 'Track usage and growth over time.' },
  { title: 'Integrations', description: 'Connect third-party tools and APIs.' },
  { title: 'Team', description: 'Manage members and permissions.' },
]

export default function NavigationMenuDemo() {
  return (
    <ComponentSection
        id="navigation-menu"
        title="Navigation Menu"
        description="A collection of links for navigating a site, with support for dropdown content."
      >
        <Example title="Site navigation" contentClassName="overflow-visible">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-72 gap-1 p-1 md:w-96 md:grid-cols-2">
                    {navLinks.map((link) => (
                      <li key={link.title}>
                        <NavigationMenuLink href="#" className="flex-col items-start gap-1">
                          <div className="text-sm font-medium">{link.title}</div>
                          <p className="text-muted-foreground text-xs">{link.description}</p>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-1 p-1">
                    <li>
                      <NavigationMenuLink href="#">Documentation</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href="#">Changelog</NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink href="#">Support</NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Example>
      </ComponentSection>
  )
}
