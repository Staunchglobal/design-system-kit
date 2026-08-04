'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { CrudScreen } from '@/components/crud/crud-screen'
import type { CrudColumn, CrudListMutators, CrudPageParams } from '@/components/crud/types'
import { Badge } from '@/components/ui/badge'
import { Toaster } from '@/components/ui/sonner'
import { setAuthSession } from '@/components/auth/auth-session'
import { useCurrentUser } from '@/components/auth/use-current-user'
import { createUserManagementFetch } from '@/components/user-management/user-management-fetch'
import { RolesDialog, AVAILABLE_ROLES } from '@/components/user-management/roles-dialog'
import { GrantsDialog } from '@/components/user-management/grants-dialog'
import type { ManagedUser, ManagedUserRow } from '@/components/user-management/types'
import {
  ARCHIVE_USER,
  IMPERSONATE_USER,
  INVITATIONS,
  RESEND_INVITATION,
  RESTORE_USER,
  SEND_INVITATION,
  UPDATE_USER,
  USERS,
  USERS_AND_INVITATIONS,
  type ArchiveUserResult,
  type ImpersonateUserResult,
  type InvitationsResult,
  type ResendInvitationResult,
  type RestoreUserResult,
  type SendInvitationResult,
  type UpdateUserResult,
  type UsersResult,
  type UsersAndInvitationsResult,
} from '@/components/user-management/user-management-operations'

export type UserManagementScreenProps = {
  graphqlUrl?: string
  /** Which tab is showing — driven by the page's own route segment (/user-management/:tab), not internal state. */
  tab: string
  onTabChange: (tab: string) => void
  /** Called after a successful impersonateUser — navigate to wherever your app's authenticated home is. */
  onImpersonated?: () => void
}

const ROLE_OPTIONS = AVAILABLE_ROLES.map((r) => ({ value: r, label: r[0]!.toUpperCase() + r.slice(1) }))

// A real user and a pending invitation can land in the same "All" feed with
// the same raw numeric `id` (they're separate database tables) — this is
// the row identity CrudScreen/DataTable actually use (React keys, insert/
// replace/remove matching), never sent to the backend, which always gets
// the bare `row.id` instead.
function rowKey(row: ManagedUserRow): string {
  return `${row.kind}:${row.id}`
}

const COLUMNS: CrudColumn<ManagedUserRow>[] = [
  { key: 'email', header: 'Email', sortable: true },
  {
    key: 'fullName',
    header: 'Name',
    mobileLabel: 'Name',
    render: (row) =>
      row.kind === 'user' ? row.fullName : <Badge variant="secondary">Pending invite</Badge>,
  },
  {
    key: 'roles',
    header: 'Roles',
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.roles.map((r) => (
          <Badge key={r} variant="secondary" className="capitalize">
            {r}
          </Badge>
        ))}
      </div>
    ),
  },
]

export function UserManagementScreen({ graphqlUrl, tab, onTabChange, onImpersonated }: UserManagementScreenProps) {
  const fetch = React.useMemo(() => createUserManagementFetch({ endpoint: graphqlUrl }), [graphqlUrl])
  const { can } = useCurrentUser(graphqlUrl)

  // Captured at the moment "Roles" is clicked, alongside that click's own
  // listMutators — RolesDialog lives outside CrudScreen, so this is how its
  // eventual `onUpdated` reaches back in to replace the row without a refetch.
  const [rolesTarget, setRolesTarget] = React.useState<{
    row: ManagedUser
    list: CrudListMutators<ManagedUserRow>
  } | null>(null)
  const [grantsTarget, setGrantsTarget] = React.useState<ManagedUser | null>(null)

  const fetchPage = React.useCallback(
    async ({ page, pageSize, search, tab: activeTab }: CrudPageParams) => {
      if (activeTab === 'pending') {
        const data = await fetch<InvitationsResult>(INVITATIONS, { page, perPage: pageSize })
        const items: ManagedUserRow[] = data.invitations.invitations.map((inv) => ({
          ...inv,
          kind: 'invitation',
        }))
        return { items, totalCount: data.invitations.pagination.count }
      }
      if (activeTab === 'all') {
        const data = await fetch<UsersAndInvitationsResult>(USERS_AND_INVITATIONS, { search, page, perPage: pageSize })
        const items: ManagedUserRow[] = data.usersAndInvitations.entries.map((entry) =>
          entry.__typename === 'User' ? { ...entry, kind: 'user' } : { ...entry, kind: 'invitation' }
        )
        return { items, totalCount: data.usersAndInvitations.pagination.count }
      }
      const data = await fetch<UsersResult>(USERS, { tab: activeTab ?? 'active', search, page, perPage: pageSize })
      const items: ManagedUserRow[] = data.users.users.map((u) => ({ ...u, kind: 'user' }))
      return { items, totalCount: data.users.pagination.count }
    },
    [fetch]
  )

  async function handleImpersonate(row: ManagedUserRow) {
    if (row.kind !== 'user') return
    try {
      const data = await fetch<ImpersonateUserResult>(IMPERSONATE_USER, { input: { userId: row.id } })
      setAuthSession({ token: data.impersonateUser.token, user: data.impersonateUser.user })
      toast.success(`Now impersonating ${row.email}`)
      onImpersonated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not impersonate user')
    }
  }

  return (
    <div className="flex w-full flex-col gap-8 p-4 sm:p-6">
      <Toaster />
      <div>
        <h2 className="text-lg font-semibold">Users</h2>
        <CrudScreen<ManagedUserRow>
          entityLabel="user"
          columns={COLUMNS}
          fetchPage={fetchPage}
          getRowId={rowKey}
          search={{ placeholder: 'Search by email…' }}
          tabs={[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Archived', value: 'archived' },
            ...(can('users:invite') ? [{ label: 'Pending', value: 'pending' }] : []),
          ]}
          activeTab={tab}
          onTabChange={onTabChange}
          withToaster={false}
          create={
            can('users:invite')
              ? {
                  title: 'Send invite',
                  addLabel: 'Send invite',
                  submitLabel: 'Send invite',
                  successMessage: 'Invitation sent',
                  initialValues: { role: AVAILABLE_ROLES[AVAILABLE_ROLES.length - 1] },
                  fields: [
                    { name: 'email', label: 'Email', required: true, placeholder: 'teammate@example.com' },
                    { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS },
                  ],
                  onSubmit: async (values) => {
                    const data = await fetch<SendInvitationResult>(SEND_INVITATION, {
                      input: { email: values.email, roles: [values.role] },
                    })
                    // The new invite only belongs on a view that shows invitations —
                    // inserting it while looking at Active/Archived would show a
                    // pending invite mixed into a list of real users.
                    if (tab !== 'pending' && tab !== 'all') return undefined
                    return { ...data.sendInvitation.invitation, kind: 'invitation' as const }
                  },
                }
              : undefined
          }
          edit={{
            title: 'Edit user',
            fields: [{ name: 'email', label: 'Email', required: true }],
            isVisible: (row) => row.kind === 'user' && row.abilities.includes('edit'),
            getValues: (row) => ({ email: row.email }),
            onSubmit: async (values, row) => {
              const data = await fetch<UpdateUserResult>(UPDATE_USER, { input: { id: row.id, email: values.email } })
              return { ...data.updateUser.user, kind: 'user' as const }
            },
          }}
          actions={[
            {
              key: 'roles',
              label: 'Roles',
              variant: 'outline',
              isVisible: (row) => row.kind === 'user' && can('users:manage_grants'),
              onClick: (row, list) => {
                if (row.kind === 'user') setRolesTarget({ row, list })
              },
            },
            {
              key: 'grants',
              label: 'Grants',
              variant: 'outline',
              isVisible: (row) => row.kind === 'user' && can('users:manage_grants'),
              onClick: (row) => {
                if (row.kind === 'user') setGrantsTarget(row)
              },
            },
            {
              key: 'archive',
              label: 'Archive',
              variant: 'destructive',
              // archive?/restore? don't check the row's own discarded state
              // server-side (they're viewer-relative, not row-state-relative)
              // — combine the ability with the row state here so Archive/
              // Restore don't both show for the same row.
              isVisible: (row) => row.kind === 'user' && !row.discarded && row.abilities.includes('archive'),
              confirm: {
                title: 'Archive this user?',
                description: 'They can be restored later from the Archived tab.',
                confirmLabel: 'Archive',
                confirmingLabel: 'Archiving…',
              },
              onClick: async (row, list) => {
                if (row.kind !== 'user') return
                await fetch<ArchiveUserResult>(ARCHIVE_USER, { input: { id: row.id } })
                // "All" still shows the row (now discarded); Active no longer does.
                if (tab === 'all') list.replaceItem(rowKey(row), { ...row, discarded: true })
                else list.removeItem(rowKey(row))
                toast.success('User archived')
              },
            },
            {
              key: 'restore',
              label: 'Restore',
              variant: 'outline',
              isVisible: (row) => row.kind === 'user' && row.discarded && row.abilities.includes('restore'),
              onClick: async (row, list) => {
                if (row.kind !== 'user') return
                await fetch<RestoreUserResult>(RESTORE_USER, { input: { id: row.id } })
                if (tab === 'all') list.replaceItem(rowKey(row), { ...row, discarded: false })
                else list.removeItem(rowKey(row))
                toast.success('User restored')
              },
            },
            {
              key: 'resend',
              label: 'Resend',
              variant: 'outline',
              isVisible: (row) => row.kind === 'invitation' && row.abilities.includes('resend'),
              onClick: async (row, list) => {
                const data = await fetch<ResendInvitationResult>(RESEND_INVITATION, { input: { id: row.id } })
                list.replaceItem(rowKey(row), { ...data.resendInvitation.invitation, kind: 'invitation' as const })
                toast.success('Invitation resent')
              },
            },
            {
              key: 'impersonate',
              label: 'Impersonate',
              variant: 'outline',
              // Already encodes "not yourself" + the restricted-role/super-admin
              // rule server-side — the row-state check just matches archive/restore.
              isVisible: (row) => row.kind === 'user' && !row.discarded && row.abilities.includes('impersonate'),
              onClick: handleImpersonate,
            },
          ]}
        />
      </div>

      <RolesDialog
        fetch={fetch}
        user={rolesTarget?.row ?? null}
        open={rolesTarget != null}
        onOpenChange={(open) => {
          if (!open) setRolesTarget(null)
        }}
        onUpdated={(updatedUser) => {
          rolesTarget?.list.replaceItem(rowKey({ ...updatedUser, kind: 'user' }), { ...updatedUser, kind: 'user' as const })
        }}
      />

      <GrantsDialog
        fetch={fetch}
        user={grantsTarget}
        open={grantsTarget != null}
        onOpenChange={(open) => {
          if (!open) setGrantsTarget(null)
        }}
      />
    </div>
  )
}
