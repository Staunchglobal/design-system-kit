import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  tag: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#374151',
    fontWeight: 'bold',
  },
})

type PdfTagProps = {
  label: string
}

function PdfTag({ label }: PdfTagProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export { PdfTag }
export type { PdfTagProps }
