import type { LeadStatus } from '@/shared/types'

export interface Lead {
  id: string
  name: string
  phone: string
  status: LeadStatus
  source: string
  createdAt: string
}
