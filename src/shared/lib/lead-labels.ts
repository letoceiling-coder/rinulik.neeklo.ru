import type { LeadStatus } from '@/shared/types'

const MAP: Record<LeadStatus, string> = {
  new: 'Новый',
  contacted: 'Связались',
  qualified: 'Квалифицирован',
  lost: 'Потерян',
}

export function leadStatusLabel(status: LeadStatus): string {
  return MAP[status]
}
