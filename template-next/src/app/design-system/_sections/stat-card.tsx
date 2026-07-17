import { Users } from 'lucide-react'
import { ComponentSection, Example, ExampleGrid } from '@/app/design-system/_lib/showcase'
import { StatCard } from '@/components/ui/stat-card'

export default function StatCardDemo() {
  return (
    <ComponentSection id="stat-card" title="Stat Card" description="KPI tile with optional icon, trend, and loading skeleton.">
      <ExampleGrid>
        <Example title="Trend up">
          <StatCard label="Active users" value="1,248" icon={<Users />} trend={{ value: '+12%', direction: 'up' }} />
        </Example>
        <Example title="Trend down">
          <StatCard label="Churn rate" value="4.2%" trend={{ value: '-1.1%', direction: 'down' }} />
        </Example>
        <Example title="Trend neutral, no icon">
          <StatCard label="Open tickets" value="86" trend={{ value: '0%', direction: 'neutral' }} />
        </Example>
        <Example title="No trend">
          <StatCard label="Total signups" value="9,204" icon={<Users />} />
        </Example>
        <Example title="Loading">
          <StatCard label="Revenue" value="" loading />
        </Example>
      </ExampleGrid>
    </ComponentSection>
  )
}
