import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  Video,
  Bot,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface DashboardNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { to: ROUTES.dashboard.root, label: 'Главная', icon: LayoutDashboard, end: true },
  { to: ROUTES.dashboard.videos, label: 'Видео', icon: Video },
  { to: ROUTES.dashboard.chats, label: 'Чаты', icon: MessageCircle },
  { to: ROUTES.dashboard.leads, label: 'Лиды', icon: Users },
  { to: ROUTES.dashboard.assistants, label: 'AI ассистенты', icon: Bot },
  { to: ROUTES.dashboard.settings, label: 'Настройки', icon: Settings },
]
