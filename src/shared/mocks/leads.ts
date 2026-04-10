import type { Lead } from '@/entities/lead'

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Анна К.',
    phone: '+7 900 111-22-33',
    status: 'new',
    source: 'Чат AI',
    createdAt: '2026-04-10T10:00:00',
  },
  {
    id: 'l2',
    name: 'ИП Смирнов',
    phone: '+7 901 444-55-66',
    status: 'contacted',
    source: 'Лендинг',
    createdAt: '2026-04-09T14:30:00',
  },
  {
    id: 'l3',
    name: 'Маркетплейс X',
    phone: '+7 902 777-88-99',
    status: 'qualified',
    source: 'Реклама',
    createdAt: '2026-04-08T09:15:00',
  },
  {
    id: 'l4',
    name: 'Стартап Y',
    phone: '+7 903 000-11-22',
    status: 'lost',
    source: 'Демо видео',
    createdAt: '2026-04-07T18:45:00',
  },
]
