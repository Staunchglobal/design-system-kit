'use client'

import * as React from 'react'

import { ImpersonationBanner } from '@/components/ui/impersonation-banner'
import { useAuthSession } from '@/components/auth/use-auth-store'
import { setAuthSession } from '@/components/auth/auth-session'
import { toast } from '@/components/auth/notify'
import { decodeJwtPayload } from '@/components/user-management/decode-jwt'
import { createUserManagementFetch } from '@/components/user-management/user-management-fetch'
import { STOP_IMPERSONATING, type StopImpersonatingResult } from '@/components/user-management/user-management-operations'

/**
 * Render once near the top of your app shell/root layout. Renders nothing
 * unless the current session's JWT carries an `impersonator_id` claim
 * (set by `impersonateUser`) — purely informational on the client; the
 * server independently re-checks every request regardless of this banner.
 *
 * `endpoint` only matters on Vite — Next's build inlines
 * `NEXT_PUBLIC_GRAPHQL_URL` into `process.env` at compile time even
 * without this prop, but Vite exposes env vars only via `import.meta.env`
 * (no `process` global in the browser), so a Vite app must pass its own
 * `import.meta.env.VITE_GRAPHQL_URL` here or every request silently falls
 * back to the mock client.
 */
export function ImpersonationStatus({ endpoint }: { endpoint?: string } = {}) {
  const userManagementFetch = React.useMemo(() => createUserManagementFetch({ endpoint }), [endpoint])
  const session = useAuthSession()
  const [stopping, setStopping] = React.useState(false)

  const impersonatorId = React.useMemo(() => {
    if (!session?.token) return null
    const payload = decodeJwtPayload(session.token)
    const raw = payload?.impersonator_id
    return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : null
  }, [session?.token])

  if (!impersonatorId) return null

  async function handleStop() {
    setStopping(true)
    try {
      const data = await userManagementFetch<StopImpersonatingResult>(STOP_IMPERSONATING, { input: {} })
      setAuthSession({ token: data.stopImpersonating.token, user: data.stopImpersonating.user })
      toast.success('Back to your own account')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not stop impersonating')
    } finally {
      setStopping(false)
    }
  }

  return (
    <ImpersonationBanner
      message={`Impersonating ${session?.user.email ?? 'a user'}`}
      actionLabel={stopping ? 'Stopping…' : 'Stop impersonating'}
      onAction={stopping ? undefined : handleStop}
    />
  )
}
