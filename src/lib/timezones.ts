const FALLBACK_TIMEZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export function getTimeZones(): string[] {
  const supportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf

  const zones =
    typeof supportedValuesOf === 'function' ? supportedValuesOf('timeZone') : FALLBACK_TIMEZONES

  const deduped = Array.from(new Set(zones.filter(Boolean))).sort((a, b) => a.localeCompare(b))
  return deduped.length ? deduped : FALLBACK_TIMEZONES
}

export function getDefaultTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

