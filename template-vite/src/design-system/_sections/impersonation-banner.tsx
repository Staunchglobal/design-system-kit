'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { ImpersonationBanner } from '@/components/ui/impersonation-banner'

export default function ImpersonationBannerDemo() {
  const [visible, setVisible] = React.useState(true)

  return (
    <ComponentSection
      id="impersonation-banner"
      title="Impersonation Banner"
      description="Sticky admin-impersonation notice with optional stop action."
    >
      <Example title="Sticky warning" contentClassName="block relative h-40 overflow-hidden rounded-lg border">
        {visible ? (
          <ImpersonationBanner
            message="You are viewing as Dr. Jane Doe"
            onAction={() => setVisible(false)}
            onDismiss={() => setVisible(false)}
          />
        ) : (
          <button
            type="button"
            className="text-muted-foreground p-4 text-sm underline"
            onClick={() => setVisible(true)}
          >
            Show banner again
          </button>
        )}
        <div className="text-muted-foreground p-4 text-sm">Page content scrolls underneath the sticky banner.</div>
      </Example>
    </ComponentSection>
  )
}
