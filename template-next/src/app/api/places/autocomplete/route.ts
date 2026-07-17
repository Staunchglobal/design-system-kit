import { NextResponse } from 'next/server'

/**
 * Proxies Google's legacy Places Autocomplete REST endpoint. Google's guidance is that
 * this endpoint isn't meant to be called directly from a browser (no CORS headers), so
 * the request has to go through a server — this route is that server.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input') ?? ''
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ status: 'REQUEST_DENIED', error_message: 'Missing API key' }, { status: 400 })
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
