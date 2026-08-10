import type { FeatureFlagMatrix } from '@/components/feature-flags-admin/types'

export const FEATURE_FLAGS = `
  query FeatureFlags {
    featureFlags {
      features
      roles
      cells { feature role enabled eligible }
    }
  }
`

export type FeatureFlagsResult = {
  featureFlags: FeatureFlagMatrix
}

// The one mutation here wraps its arguments in a single `$input` variable —
// the backend's mutations extend GraphQL::Schema::RelayClassicMutation.
export const UPDATE_FEATURE_FLAG = `
  mutation UpdateFeatureFlag($input: UpdateFeatureFlagInput!) {
    updateFeatureFlag(input: $input) {
      feature
      role
      enabled
    }
  }
`

export type UpdateFeatureFlagResult = {
  updateFeatureFlag: { feature: string; role: string; enabled: boolean }
}
