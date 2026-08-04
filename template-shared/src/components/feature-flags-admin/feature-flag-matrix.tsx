'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ErrorState } from '@/components/ui/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { FeatureFlagCell, FeatureFlagsFetch } from '@/components/feature-flags-admin/types'
import {
  FEATURE_FLAGS,
  UPDATE_FEATURE_FLAG,
  type FeatureFlagsResult,
  type UpdateFeatureFlagResult,
} from '@/components/feature-flags-admin/feature-flags-admin-operations'

function humanize(name: string): string {
  return name
    .split('_')
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ')
}

export function FeatureFlagMatrix({ fetch }: { fetch: FeatureFlagsFetch }) {
  const [features, setFeatures] = React.useState<string[]>([])
  const [roles, setRoles] = React.useState<string[]>([])
  const [cells, setCells] = React.useState<FeatureFlagCell[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetch<FeatureFlagsResult>(FEATURE_FLAGS)
      setFeatures(data.featureFlags.features)
      setRoles(data.featureFlags.roles)
      setCells(data.featureFlags.cells)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load feature flags')
    } finally {
      setLoading(false)
    }
  }, [fetch])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kick off the initial matrix fetch
    void load()
  }, [load])

  function cellFor(feature: string, role: string) {
    return cells.find((c) => c.feature === feature && c.role === role)
  }

  async function toggle(feature: string, role: string, enabled: boolean) {
    const key = `${feature}:${role}`
    const previous = cells
    setCells((prev) => prev.map((c) => (c.feature === feature && c.role === role ? { ...c, enabled } : c)))
    setPending(key)
    try {
      await fetch<UpdateFeatureFlagResult>(UPDATE_FEATURE_FLAG, { input: { feature, role, enabled } })
    } catch (err) {
      setCells(previous)
      toast.error(err instanceof Error ? err.message : 'Could not update the flag')
    } finally {
      setPending(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <ErrorState title="Could not load feature flags" description={error} onRetry={load} />
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            {roles.map((role) => (
              <TableHead key={role} className="text-center capitalize">
                {role}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => (
            <TableRow key={feature}>
              <TableCell className="font-medium">{humanize(feature)}</TableCell>
              {roles.map((role) => {
                const cell = cellFor(feature, role)
                const key = `${feature}:${role}`
                return (
                  <TableCell key={role} className="text-center">
                    <Checkbox
                      checked={Boolean(cell?.enabled)}
                      disabled={pending === key}
                      onCheckedChange={(checked) => toggle(feature, role, checked === true)}
                      aria-label={`${humanize(feature)} for ${role}`}
                    />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
