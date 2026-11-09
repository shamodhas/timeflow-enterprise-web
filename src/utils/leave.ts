// Short leave = 0.25 day, half day = 0.5 day
export const formatLeaveDays = (value: number | string): string => {
  const quarters = Math.round(Number(value || 0) * 4)
  const days = Math.floor(quarters / 4)
  const rest = quarters % 4
  const half = Math.floor(rest / 2)
  const short = rest % 2
  const parts: string[] = []
  if (days) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
  if (half) parts.push('1 half day')
  if (short) parts.push('1 short')
  return parts.length ? parts.join(' and ') : '0 days'
}
