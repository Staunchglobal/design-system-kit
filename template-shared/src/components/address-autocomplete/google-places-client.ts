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

export async function fetchPlacePredictions(
  input: string,
  apiKey: string,
  opts?: { country?: string }
): Promise<PlacePrediction[]> {
  if (!input.trim() || !apiKey) return []

  const params = new URLSearchParams({
    input: input.trim(),
    key: apiKey,
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

export async function fetchPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetails> {
  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
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
