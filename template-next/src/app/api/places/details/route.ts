import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('place_id') ?? ''
  // Server-only — never NEXT_PUBLIC_*. See autocomplete/route.ts's comment.
  const key = process.env.GOOGLE_PLACES_API_KEY

  if (!key) {
    return NextResponse.json(
      { status: 'REQUEST_DENIED', error_message: 'Server is missing GOOGLE_PLACES_API_KEY' },
      { status: 500 }
    )
  }
  if (!placeId) {
    return NextResponse.json({ status: 'INVALID_REQUEST', error_message: 'Missing place_id' }, { status: 400 })
  }

  const upstream = new URLSearchParams({
    place_id: placeId,
    key,
    fields: 'formatted_address,geometry,address_component',
  })

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${upstream.toString()}`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
