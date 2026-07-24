import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('place_id') ?? ''
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ status: 'REQUEST_DENIED', error_message: 'Missing API key' }, { status: 400 })
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
