'use client'

import * as React from 'react'
import { PDFDownloadLink, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ComponentSection, Example } from '@/app/design-system/_lib/showcase'
import { PdfDocumentShell, PdfInfoField, PdfTag } from '@/components/ui/pdf-document-kit'
import { Button } from '@/components/ui/button'

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  section: { marginBottom: 16 },
})

function SampleDocument() {
  return (
    <PdfDocumentShell title="Session summary">
      <View style={styles.row}>
        <PdfTag label="Strength" />
        <PdfTag label="Draft" />
      </View>
      <View style={styles.section}>
        <PdfInfoField label="Athlete" value="Alex Morgan" />
        <PdfInfoField label="Coach" value="Sam Rivera" />
        <PdfInfoField label="Notes" value="Focus on tempo and bracing." />
      </View>
      <Text>Compose your own Document from these primitives the way SequencePDF does.</Text>
    </PdfDocumentShell>
  )
}

function useIsClient() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function PdfDocumentKitDemo() {
  const ready = useIsClient()

  return (
    <ComponentSection
      id="pdf-document-kit"
      title="PDF Document Kit"
      description="Starter @react-pdf/renderer primitives — shell, tag, and info field. Compose your own reports; this is not a full report builder."
    >
      <Example title="Download sample PDF" contentClassName="block space-y-3">
        <p className="text-muted-foreground text-sm">
          PdfDocumentShell + PdfTag + PdfInfoField composed into a downloadable sample.
        </p>
        {ready ? (
          <PDFDownloadLink document={<SampleDocument />} fileName="session-summary.pdf">
            {({ loading }) => (
              <Button type="button" disabled={loading}>
                {loading ? 'Preparing…' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button type="button" disabled>
            Preparing…
          </Button>
        )}
      </Example>
    </ComponentSection>
  )
}
