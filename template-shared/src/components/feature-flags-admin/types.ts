export type FeatureFlagCell = {
  feature: string
  role: string
  enabled: boolean
  // False when this role's own backend policy for the feature hard-denies
  // it regardless of `enabled` — the matrix renders these as a disabled,
  // unchecked cell instead of a checkbox that could never take effect.
  eligible: boolean
}

export type FeatureFlagMatrix = {
  features: string[]
  roles: string[]
  cells: FeatureFlagCell[]
}

export type FeatureFlagsFetch = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>
