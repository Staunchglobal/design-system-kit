---
"staunch-shadcn-design-system-kit": major
---

Fix Google Places API key being sent to the client at all — it was both exposed in the bundle/Network tab *and* still proxied through `/api/places/*`, the worst of both approaches (a leaked key is directly billable against your Google Cloud project, and a server-to-server call can't be scoped by HTTP referrer anyway).

- `AddressAutocomplete`'s `apiKey` prop is removed. The key now lives server-side only, as `GOOGLE_PLACES_API_KEY` (never `NEXT_PUBLIC_`/`VITE_`-prefixed) — read directly by the Next API routes and the Vite dev middleware.
- **Breaking**: if you pass `apiKey` to `<AddressAutocomplete>`, remove it and set `GOOGLE_PLACES_API_KEY` in your server environment instead.
