import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input') ?? ''
  // Server-only — never NEXT_PUBLIC_*. This route is the sole holder of
  // the key; a client-supplied key would defeat the point of proxying
  // through here at all (see google-places-client.ts's comment).
  const key = process.env.GOOGLE_PLACES_API_KEY

  if (!key) {
    return NextResponse.json(
      { status: 'REQUEST_DENIED', error_message: 'Server is missing GOOGLE_PLACES_API_KEY' },
      { status: 500 }
    )
  }
  if (!input.trim()) {
    return NextResponse.json({ status: 'ZERO_RESULTS', predictions: [] })
  }

  const upstream = new URLSearchParams({ input, key, types: 'address' })
  const components = searchParams.get('components')
  if (components) upstream.set('components', components)

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${upstream.toString()}`
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
