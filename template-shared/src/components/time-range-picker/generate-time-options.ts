export function generateTimeOptions(
  stepMinutes: number
): { label: string; value: string }[] {
  const step = Math.max(1, Math.min(60, stepMinutes))
  const options: { label: string; value: string }[] = []
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const hour12 = h % 12 === 0 ? 12 : h % 12
    const ampm = h < 12 ? 'AM' : 'PM'
    const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
    options.push({ label, value })
  }
  return options
}
