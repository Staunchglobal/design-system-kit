export type PlacePrediction = {
  placeId: string
  description: string
}

export type PlaceDetails = {
  formattedAddress: string
  suburb: string
  state: string
  postcode: string
  lat: number | null
  lng: number | null
}

type AutocompleteResponse = {
  predictions?: Array<{
    place_id: string
    description: string
  }>
  status?: string
  error_message?: string
}

type DetailsResponse = {
  result?: {
    formatted_address?: string
    geometry?: { location?: { lat: number; lng: number } }
    address_components?: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
  }
  status?: string
  error_message?: string
}

type AddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

function component(components: AddressComponent[] | undefined, type: string, short = false): string {
  if (!components) return ''
  const match = components.find((c) => c.types.includes(type))
  if (!match) return ''
  return short ? match.short_name : match.long_name
}

// No API key parameter here on purpose — the key lives server-side only
// (`GOOGLE_PLACES_API_KEY`, read by the `/api/places/*` proxy routes/dev
// middleware), never in a `NEXT_PUBLIC_*`/`VITE_*` var. A server-to-server
// call to Google can't be restricted by HTTP referrer, so a key that ever
// reached the browser bundle (or even just the Network tab, forwarded
// unused) would be silently billable by anyone who scraped it — the
// proxy's whole point is defeated if the client still holds the secret.
export async function fetchPlacePredictions(
  input: string,
  opts?: { country?: string }
): Promise<PlacePrediction[]> {
  if (!input.trim()) return []

  const params = new URLSearchParams({
    input: input.trim(),
    types: 'address',
  })
  if (opts?.country) {
    params.set('components', `country:${opts.country}`)
  }

  const res = await fetch(`/api/places/autocomplete?${params.toString()}`)
  if (!res.ok) throw new Error(`Places autocomplete failed (${res.status})`)
  const data = (await res.json()) as AutocompleteResponse
  if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(data.error_message || `Places autocomplete status: ${data.status}`)
  }
  return (data.predictions ?? []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
  }))
}

export async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'formatted_address,geometry,address_component',
  })
  const res = await fetch(`/api/places/details?${params.toString()}`)
  if (!res.ok) throw new Error(`Place details failed (${res.status})`)
  const data = (await res.json()) as DetailsResponse
  if (data.status && data.status !== 'OK') {
    throw new Error(data.error_message || `Place details status: ${data.status}`)
  }
  const result = data.result
  const components = result?.address_components
  return {
    formattedAddress: result?.formatted_address ?? '',
    suburb:
      component(components, 'locality') ||
      component(components, 'sublocality') ||
      component(components, 'postal_town'),
    state: component(components, 'administrative_area_level_1', true),
    postcode: component(components, 'postal_code'),
    lat: result?.geometry?.location?.lat ?? null,
    lng: result?.geometry?.location?.lng ?? null,
  }
}
