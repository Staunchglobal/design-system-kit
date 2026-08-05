'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { createAuthFetch } from '@/components/auth/auth-fetch'
import { CURRENT_USER, type CurrentUserResult } from '@/components/auth/auth-operations'
import { getAuthSession } from '@/components/auth/auth-session'

/**
 * Fetches `currentUser` once — the single source of truth for what the
 * signed-in user is allowed to see (nav items, buttons, tabs). Used by the
 * private-route layout itself (to filter the sidebar) and by any admin
 * screen that needs to hide actions the current user can't perform.
 * Server-side Pundit is still the real enforcement boundary; this is UX
 * only, same as `ImpersonationStatus`'s own client-side JWT decode.
 */
export function useCurrentUser(endpoint?: string) {
  const fetch = React.useMemo(() => createAuthFetch({ endpoint }), [endpoint])
  const [roles, setRoles] = React.useState<string[]>([])
  const [abilities, setAbilities] = React.useState<string[]>([])
  const [impersonatorId, setImpersonatorId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    // No session yet (e.g. this render is the brief flash before a private
    // route redirects to /login) — skip the request instead of surfacing a
    // spurious "unauthenticated" error toast for an expected logged-out state.
    // Still routed through the same .then/.finally chain (rather than an
    // early `return` that calls setState synchronously in the effect body)
    // to avoid a cascading-render lint error.
    const hasSession = Boolean(getAuthSession()?.token)
    // `loading` already starts `true` — no need to set it again here.
    ;(hasSession ? fetch<CurrentUserResult>(CURRENT_USER) : Promise.resolve(null))
      .then((data) => {
        if (cancelled || !data) return
        setRoles(data.currentUser.roles)
        setAbilities(data.currentUser.abilities)
        setImpersonatorId(data.currentUser.impersonatorId)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Fail closed (no abilities → every gated nav item/button stays
        // hidden) but still say why, otherwise a real admin hitting a
        // transient error loses access silently.
        setRoles([])
        setAbilities([])
        setImpersonatorId(null)
        toast.error(err instanceof Error ? err.message : 'Could not load your permissions')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetch])

  const can = React.useCallback((ability: string) => abilities.includes(ability), [abilities])

  return { roles, abilities, can, impersonatorId, loading }
}
