export type FeatureFlagCell = {
  feature: string
  role: string
  enabled: boolean
}

export type FeatureFlagMatrix = {
  features: string[]
  roles: string[]
  cells: FeatureFlagCell[]
}

export type FeatureFlagsFetch = <T>(query: string, variables?: Record<string, unknown>) => Promise<T>
