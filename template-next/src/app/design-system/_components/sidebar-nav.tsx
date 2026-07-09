'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { NAV_GROUPS } from '@/app/design-system/_lib/nav'

export function SidebarNav() {
  const allIds = React.useMemo(
    () => NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
    []
  )
  const [activeId, setActiveId] = React.useState<string>(allIds[0] ?? '')

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    )

    allIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [allIds])

  return (
    <nav aria-label="Component sections" className="space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1.5">
          <h4 className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
            {group.title}
          </h4>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    'block rounded-md px-2 py-1 text-sm transition-colors',
                    activeId === item.id
                      ? 'bg-muted text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
