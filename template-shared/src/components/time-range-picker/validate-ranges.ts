export type TimeRange = { start: string; end: string }

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Returns pairs of overlapping range indices (inclusive overlap). */
export function findOverlappingRanges(ranges: TimeRange[]): [number, number][] {
  const pairs: [number, number][] = []
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const a = ranges[i]
      const b = ranges[j]
      const aStart = toMinutes(a.start)
      const aEnd = toMinutes(a.end)
      const bStart = toMinutes(b.start)
      const bEnd = toMinutes(b.end)
      if (aStart < bEnd && bStart < aEnd) {
        pairs.push([i, j])
      }
    }
  }
  return pairs
}
