import * as React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  body: {
    flex: 1,
  },
})

type PdfDocumentShellProps = {
  children: React.ReactNode
  /** Document title shown in the PDF metadata and optionally in the header. */
  title?: string
  /** Custom header content rendered above the body. When omitted and `title` is set, a default title header is shown. */
  header?: React.ReactNode
}

function PdfDocumentShell({ children, title, header }: PdfDocumentShellProps) {
  const resolvedHeader =
    header ??
    (title ? (
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
    ) : null)

  return (
    <Document title={title}>
      <Page style={styles.page}>
        {resolvedHeader}
        <View style={styles.body}>{children}</View>
      </Page>
    </Document>
  )
}

export { PdfDocumentShell }
export type { PdfDocumentShellProps }
