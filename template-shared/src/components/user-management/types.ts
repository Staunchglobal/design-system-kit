export type ManagedUser = {
  id: string
  email: string
  fullName: string
  imageUrl: string | null
  roles: string[]
  discarded: boolean
  /** Per-row abilities computed server-side for the *viewer* (e.g. "edit", "archive", "impersonate") — see auth/types.ts's CurrentUser doc. */
  abilities: string[]
}

export type Pagination = {
  page: number
  pages: number
  count: number
  perPage: number
}

export type Invitation = {
  id: string
  email: string
  roles: string[]
  expiresAt: string
  createdAt: string
  /** Per-row abilities computed server-side for the *viewer* (e.g. "resend"). */
  abilities: string[]
}

/**
 * The Users list mixes real users with pending invitations under one set of
 * tabs (Active/Archived/Pending) — `kind` discriminates which one a row is,
 * the same way `delivery-logs` discriminates its GraphQL union via
 * `__typename`. There's no backend union here (users/invitations are two
 * separate queries), so `kind` is stamped on client-side when mapping each
 * query's rows.
 */
export type ManagedUserRow = (ManagedUser & { kind: 'user' }) | (Invitation & { kind: 'invitation' })

export type Grant = {
  id: string
  grantableType: string
  grantableId: string
  grantedAt: string
  grantedById: string | null
}

export type UserManagementFetch = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>
