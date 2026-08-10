'use client'

import * as React from 'react'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import type { PlaceDetails } from '@/components/ui/address-autocomplete'

export default function AddressAutocompleteDemo() {
  const [value, setValue] = React.useState('')
  const [details, setDetails] = React.useState<PlaceDetails | null>(null)
  return (
    <ComponentSection
      id="address-autocomplete"
      title="Address Autocomplete"
      description="Google Places REST autocomplete, proxied through /api/places/*. Requires GOOGLE_PLACES_API_KEY set server-side (never NEXT_PUBLIC_*)."
    >
      <Example title="Server API key required" contentClassName="block w-full max-w-md">
        <div className="space-y-2">
          <AddressAutocomplete
            value={value}
            onValueChange={setValue}
            onSelect={setDetails}
            country="au"
          />
          {details ? (
            <pre className="bg-muted overflow-auto rounded-md p-2 text-xs">
              {JSON.stringify(details, null, 2)}
            </pre>
          ) : null}
        </div>
      </Example>
    </ComponentSection>
  )
}
