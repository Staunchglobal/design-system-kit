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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import type { ManagedUser, UserManagementFetch } from '@/components/user-management/types'
import { UPDATE_USER_ROLES, type UpdateUserRolesResult } from '@/components/user-management/user-management-operations'

// Matches the gem's DEFAULT_ROLES (config.available_roles) — there's no
// query exposing the configured role list itself, so this mirrors the
// default rather than fetching it. Update this if your app configures a
// different `config.available_roles`.
export const AVAILABLE_ROLES = ['admin', 'manager', 'member']

export function RolesDialog({
  fetch,
  user,
  open,
  onOpenChange,
  onUpdated,
}: {
  fetch: UserManagementFetch
  user: ManagedUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (user: ManagedUser) => void
}) {
  const [selected, setSelected] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the checkbox selection to match whichever user the dialog opened for
    if (user) setSelected(user.roles)
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const data = await fetch<UpdateUserRolesResult>(UPDATE_USER_ROLES, { input: { id: user.id, roles: selected } })
      onUpdated(data.updateUserRoles.user)
      toast.success('Roles updated')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update roles')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage roles</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {AVAILABLE_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selected.includes(role)}
                onCheckedChange={(checked) => {
                  setSelected((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
                }}
              />
              <span className="capitalize">{role}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save roles'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
