import type { Grant, Invitation, ManagedUser, Pagination } from '@/components/user-management/types'

// Queries/resolvers take flat top-level arguments — only mutations below
// wrap their arguments in a single `$input` object (the backend's
// mutations extend GraphQL::Schema::RelayClassicMutation, which always
// exposes declared arguments as one input object on the wire).

export const USERS = `
  query Users($tab: String, $search: String, $page: Int, $perPage: Int) {
    users(tab: $tab, search: $search, page: $page, perPage: $perPage) {
      users { id email fullName imageUrl roles discarded abilities }
      pagination { page pages count perPage }
    }
  }
`

export type UsersResult = {
  users: { users: ManagedUser[]; pagination: Pagination }
}

export const INVITATIONS = `
  query Invitations($page: Int, $perPage: Int) {
    invitations(page: $page, perPage: $perPage) {
      invitations { id email roles expiresAt createdAt abilities }
      pagination { page pages count perPage }
    }
  }
`

export type InvitationsResult = {
  invitations: { invitations: Invitation[]; pagination: Pagination }
}

// `usersAndInvitations` returns a union — GraphQL derives each type's
// schema name from its Ruby class name minus "Type" (Types::UserType ->
// "User", Types::InvitationType -> "Invitation"), not the Ruby class name
// itself, hence the fragment names below.
export const USERS_AND_INVITATIONS = `
  query UsersAndInvitations($search: String, $page: Int, $perPage: Int) {
    usersAndInvitations(search: $search, page: $page, perPage: $perPage) {
      entries {
        __typename
        ... on User { id email fullName imageUrl roles discarded abilities }
        ... on Invitation { id email roles expiresAt createdAt abilities }
      }
      pagination { page pages count perPage }
    }
  }
`

export type UsersAndInvitationsEntry =
  | ({ __typename: 'User' } & ManagedUser)
  | ({ __typename: 'Invitation' } & Invitation)

export type UsersAndInvitationsResult = {
  usersAndInvitations: { entries: UsersAndInvitationsEntry[]; pagination: Pagination }
}

export const GRANTS = `
  query Grants($userId: ID!) {
    grants(userId: $userId) {
      id
      grantableType
      grantableId
      grantedAt
      grantedById
    }
  }
`

export type GrantsResult = {
  grants: Grant[]
}

export const UPDATE_USER = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user { id email fullName imageUrl roles discarded abilities }
    }
  }
`

export type UpdateUserResult = {
  updateUser: { user: ManagedUser }
}

export const ARCHIVE_USER = `
  mutation ArchiveUser($input: ArchiveUserInput!) {
    archiveUser(input: $input) {
      success
    }
  }
`

export type ArchiveUserResult = {
  archiveUser: { success: boolean }
}

export const RESTORE_USER = `
  mutation RestoreUser($input: RestoreUserInput!) {
    restoreUser(input: $input) {
      success
    }
  }
`

export type RestoreUserResult = {
  restoreUser: { success: boolean }
}

export const UPDATE_USER_ROLES = `
  mutation UpdateUserRoles($input: UpdateUserRolesInput!) {
    updateUserRoles(input: $input) {
      user { id email fullName imageUrl roles discarded abilities }
    }
  }
`

export type UpdateUserRolesResult = {
  updateUserRoles: { user: ManagedUser }
}

export const SEND_INVITATION = `
  mutation SendInvitation($input: SendInvitationInput!) {
    sendInvitation(input: $input) {
      invitation { id email roles expiresAt createdAt abilities }
    }
  }
`

export type SendInvitationResult = {
  sendInvitation: { invitation: Invitation }
}

export const RESEND_INVITATION = `
  mutation ResendInvitation($input: ResendInvitationInput!) {
    resendInvitation(input: $input) {
      invitation { id email roles expiresAt createdAt abilities }
    }
  }
`

export type ResendInvitationResult = {
  resendInvitation: { invitation: Invitation }
}

export const CREATE_GRANT = `
  mutation CreateGrant($input: CreateGrantInput!) {
    createGrant(input: $input) {
      grant { id grantableType grantableId grantedAt grantedById }
    }
  }
`

export type CreateGrantResult = {
  createGrant: { grant: Grant }
}

export const REVOKE_GRANT = `
  mutation RevokeGrant($input: RevokeGrantInput!) {
    revokeGrant(input: $input) {
      success
    }
  }
`

export type RevokeGrantResult = {
  revokeGrant: { success: boolean }
}

export const IMPERSONATE_USER = `
  mutation ImpersonateUser($input: ImpersonateUserInput!) {
    impersonateUser(input: $input) {
      token
      user { id email fullName imageUrl }
    }
  }
`

export type ImpersonateUserResult = {
  impersonateUser: { token: string; user: { id: string; email: string; fullName: string; imageUrl: string | null } }
}

export const STOP_IMPERSONATING = `
  mutation StopImpersonating($input: StopImpersonatingInput!) {
    stopImpersonating(input: $input) {
      token
      user { id email fullName imageUrl }
    }
  }
`

export type StopImpersonatingResult = {
  stopImpersonating: { token: string; user: { id: string; email: string; fullName: string; imageUrl: string | null } }
}
