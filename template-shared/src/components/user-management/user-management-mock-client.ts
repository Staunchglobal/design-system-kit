import type { Grant, Invitation, ManagedUser } from '@/components/user-management/types'

export const USER_MANAGEMENT_MOCK_ENDPOINT = 'mock://user-management'

// The mock has no role system to demo (see auth-mock-client.ts's CurrentUser
// case) — every row gets the full action set so the CRUD screen itself is
// still exercisable in pure-mock mode.
const ALL_USER_ABILITIES = ['edit', 'archive', 'restore', 'impersonate']
const ALL_INVITATION_ABILITIES = ['resend']

let nextId = 4
const users: ManagedUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    fullName: 'Demo Admin',
    imageUrl: null,
    roles: ['admin'],
    discarded: false,
    abilities: ALL_USER_ABILITIES,
  },
  {
    id: '2',
    email: 'manager@example.com',
    fullName: 'Demo Manager',
    imageUrl: null,
    roles: ['manager'],
    discarded: false,
    abilities: ALL_USER_ABILITIES,
  },
  {
    id: '3',
    email: 'member@example.com',
    fullName: 'Demo Member',
    imageUrl: null,
    roles: ['member'],
    discarded: false,
    abilities: ALL_USER_ABILITIES,
  },
]
let invitations: Invitation[] = []
let grants: Grant[] = []

function opName(query: string): string {
  const m = query.match(/\b(?:mutation|query)\s+(\w+)/)
  return m?.[1] ?? ''
}

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function userManagementMockFetch<T>(
  _endpoint: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  await delay()
  const name = opName(query)
  const input = (variables.input ?? {}) as Record<string, unknown>

  switch (name) {
    case 'Users': {
      const tab = String(variables.tab ?? 'active')
      const search = String(variables.search ?? '').toLowerCase()
      const page = Number(variables.page ?? 1)
      const perPage = Number(variables.perPage ?? 25)
      let scoped = users.filter((u) => (tab === 'archived' ? u.discarded : !u.discarded))
      if (search) scoped = scoped.filter((u) => u.email.toLowerCase().includes(search))
      const count = scoped.length
      const pages = count === 0 ? 0 : Math.ceil(count / perPage)
      const start = (page - 1) * perPage
      return {
        users: { users: scoped.slice(start, start + perPage), pagination: { page, pages, count, perPage } },
      } as T
    }

    case 'UsersAndInvitations': {
      const search = String(variables.search ?? '').toLowerCase()
      const page = Number(variables.page ?? 1)
      const perPage = Number(variables.perPage ?? 25)
      let combined = [
        ...invitations.map((inv) => ({ __typename: 'Invitation' as const, ...inv })),
        ...users.map((u) => ({ __typename: 'User' as const, ...u })),
      ]
      if (search) combined = combined.filter((e) => e.email.toLowerCase().includes(search))
      const count = combined.length
      const pages = count === 0 ? 0 : Math.ceil(count / perPage)
      const start = (page - 1) * perPage
      return {
        usersAndInvitations: {
          entries: combined.slice(start, start + perPage),
          pagination: { page, pages, count, perPage },
        },
      } as T
    }

    case 'Invitations': {
      const page = Number(variables.page ?? 1)
      const perPage = Number(variables.perPage ?? 25)
      return {
        invitations: {
          invitations,
          pagination: { page, pages: invitations.length ? 1 : 0, count: invitations.length, perPage },
        },
      } as T
    }

    case 'Grants': {
      // The mock has one shared grant list (no per-user modeling) — good
      // enough for a demo, real backend calls are actually scoped by userId.
      return { grants } as T
    }

    case 'UpdateUser': {
      const id = String(input.id ?? '')
      const email = String(input.email ?? '')
      const user = users.find((u) => u.id === id)
      if (!user) throw new Error('User not found')
      user.email = email
      return { updateUser: { user } } as T
    }

    case 'ArchiveUser': {
      const id = String(input.id ?? '')
      const user = users.find((u) => u.id === id)
      if (user) user.discarded = true
      return { archiveUser: { success: Boolean(user) } } as T
    }

    case 'RestoreUser': {
      const id = String(input.id ?? '')
      const user = users.find((u) => u.id === id)
      if (user) user.discarded = false
      return { restoreUser: { success: Boolean(user) } } as T
    }

    case 'UpdateUserRoles': {
      const id = String(input.id ?? '')
      const roles = (input.roles as string[]) ?? []
      const user = users.find((u) => u.id === id)
      if (!user) throw new Error('User not found')
      user.roles = roles
      return { updateUserRoles: { user } } as T
    }

    case 'SendInvitation': {
      const email = String(input.email ?? '')
      const roles = (input.roles as string[]) ?? []
      const invitation: Invitation = {
        id: String(nextId++),
        email,
        roles,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        abilities: ALL_INVITATION_ABILITIES,
      }
      invitations = [invitation, ...invitations]
      return { sendInvitation: { invitation } } as T
    }

    case 'ResendInvitation': {
      const id = String(input.id ?? '')
      const invitation = invitations.find((i) => i.id === id)
      if (!invitation) throw new Error('Invitation not found')
      invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      return { resendInvitation: { invitation } } as T
    }

    case 'CreateGrant': {
      const grant: Grant = {
        id: String(nextId++),
        grantableType: String(input.grantableType ?? ''),
        grantableId: String(input.grantableId ?? ''),
        grantedAt: new Date().toISOString(),
        grantedById: '1',
      }
      grants = [grant, ...grants]
      return { createGrant: { grant } } as T
    }

    case 'RevokeGrant': {
      const grantId = String(input.grantId ?? '')
      grants = grants.filter((g) => g.id !== grantId)
      return { revokeGrant: { success: true } } as T
    }

    case 'ImpersonateUser': {
      const userId = String(input.userId ?? '')
      const user = users.find((u) => u.id === userId)
      if (!user) throw new Error('User not found')
      return { impersonateUser: { token: `mock-impersonation-token-${user.id}`, user } } as T
    }

    case 'StopImpersonating': {
      const admin = users[0]!
      return { stopImpersonating: { token: 'mock-admin-token', user: admin } } as T
    }

    default:
      throw new Error(`Unknown user-management operation: ${name || '(unnamed)'}`)
  }
}
