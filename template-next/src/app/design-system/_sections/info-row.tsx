import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { Button } from '@/components/ui/button'
import { InfoCard, InfoList, InfoRow } from '@/components/ui/info-row'

export default function InfoRowDemo() {
  return (
    <ComponentSection id="info-row" title="Info Row" description="Description-list rows, grids, and card wrappers.">
      <Example title="Info card" contentClassName="block w-full max-w-lg">
        <InfoCard title="Patient details" action={<Button size="sm" variant="outline">Edit</Button>} columns={2}>
          <InfoRow label="Name" value="Ada Lovelace" />
          <InfoRow label="Email" value="ada@example.com" />
          <InfoRow label="Phone" value="" />
          <InfoRow label="Status" value="Active" orientation="stacked" />
        </InfoCard>
      </Example>
      <Example title="Info list (standalone, no card wrapper)" contentClassName="block w-full max-w-lg">
        <InfoList columns={3}>
          <InfoRow label="Plan" value="Pro" />
          <InfoRow label="Seats" value="12" />
          <InfoRow label="Renews" value="Mar 4, 2027" />
        </InfoList>
      </Example>
    </ComponentSection>
  )
}
