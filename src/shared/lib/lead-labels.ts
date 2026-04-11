const MAP: Record<string, string> = {
  NEW: 'Новый',
  CONTACTED: 'Связались',
  QUALIFIED: 'Квалифицирован',
  LOST: 'Потерян',
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  lost: 'Потерян',
}

export function leadStatusLabel(status: string): string {
  const direct = MAP[status]
  if (direct) return direct
  const upper = status.toUpperCase()
  return MAP[upper] ?? status
}
