'use client'

import * as React from 'react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import type { Grant, ManagedUser, UserManagementFetch } from '@/components/user-management/types'
import {
  CREATE_GRANT,
  GRANTS,
  REVOKE_GRANT,
  type CreateGrantResult,
  type GrantsResult,
  type RevokeGrantResult,
} from '@/components/user-management/user-management-operations'

export function GrantsDialog({
  fetch,
  user,
  open,
  onOpenChange,
}: {
  fetch: UserManagementFetch
  user: ManagedUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [grants, setGrants] = React.useState<Grant[]>([])
  const [loading, setLoading] = React.useState(false)
  const [grantableType, setGrantableType] = React.useState('SaasKit::Chat')
  const [grantableId, setGrantableId] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [revokingId, setRevokingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetch<GrantsResult>(GRANTS, { userId: user.id })
      setGrants(data.grants)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load grants')
    } finally {
      setLoading(false)
    }
  }, [fetch, user])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load grants when the dialog opens
    if (open) void load()
  }, [open, load])

  async function handleCreate() {
    if (!user || !grantableId.trim()) return
    setCreating(true)
    try {
      const data = await fetch<CreateGrantResult>(CREATE_GRANT, {
        input: { userId: user.id, grantableType, grantableId: grantableId.trim() },
      })
      setGrants((prev) => [data.createGrant.grant, ...prev])
      setGrantableId('')
      toast.success('Access granted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create grant')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(grant: Grant) {
    if (!user) return
    setRevokingId(grant.id)
    try {
      await fetch<RevokeGrantResult>(REVOKE_GRANT, { input: { userId: user.id, grantId: grant.id } })
      setGrants((prev) => prev.filter((g) => g.id !== grant.id))
      toast.success('Access revoked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not revoke grant')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Access grants</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-muted-foreground text-xs">Resource type</label>
            <Input value={grantableType} onChange={(e) => setGrantableType(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-muted-foreground text-xs">Resource ID</label>
            <Input value={grantableId} onChange={(e) => setGrantableId(e.target.value)} placeholder="e.g. 1" />
          </div>
          <Button type="button" onClick={handleCreate} disabled={creating || !grantableId.trim()}>
            Grant
          </Button>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : grants.length === 0 ? (
            <Empty>
              <EmptyTitle>No active grants</EmptyTitle>
              <EmptyDescription>Grant access to a resource above.</EmptyDescription>
            </Empty>
          ) : (
            grants.map((grant) => (
              <div key={grant.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span>
                  {grant.grantableType} #{grant.grantableId}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={revokingId === grant.id}
                  onClick={() => handleRevoke(grant)}
                >
                  {revokingId === grant.id ? 'Revoking…' : 'Revoke'}
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
