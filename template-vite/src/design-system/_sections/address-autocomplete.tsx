import * as React from 'react'
import { ComponentSection, Example } from '@/design-system/_lib/showcase'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import type { PlaceDetails } from '@/components/ui/address-autocomplete'

export default function AddressAutocompleteDemo() {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? ''
  const [value, setValue] = React.useState('')
  const [details, setDetails] = React.useState<PlaceDetails | null>(null)
  return (
    <ComponentSection
      id="address-autocomplete"
      title="Address Autocomplete"
      description="Google Places REST autocomplete. Requires a consumer-supplied API key."
    >
      <Example title="API key required" contentClassName="block w-full max-w-md">
        <div className="space-y-2">
          <AddressAutocomplete
            apiKey={apiKey}
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
