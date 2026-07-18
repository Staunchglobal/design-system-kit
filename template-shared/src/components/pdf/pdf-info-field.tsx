import * as React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#111827',
  },
})

type PdfInfoFieldProps = {
  label: string
  /**
   * The value to display. Must be a react-pdf-compatible node — i.e. `Text`, `View`, or
   * a primitive (string / number). Passing DOM elements will cause a runtime render error.
   */
  value: React.ReactNode
}

function PdfInfoField({ label, value }: PdfInfoFieldProps) {
  const isLeafValue = typeof value === 'string' || typeof value === 'number' || value == null

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {isLeafValue ? (
        <Text style={styles.value}>{value ?? '—'}</Text>
      ) : (
        <View>{value}</View>
      )}
    </View>
  )
}

export { PdfInfoField }
export type { PdfInfoFieldProps }
