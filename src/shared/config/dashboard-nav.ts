import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Video,
  Layers,
  CreditCard,
  Sparkles,
  ImageIcon,
  Package,
  MessageSquare,
  Settings,
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
  { to: ROUTES.dashboard.services, label: 'Услуги', icon: Layers },
  { to: ROUTES.dashboard.tariffs, label: 'Тарифы', icon: CreditCard },
  { to: ROUTES.dashboard.advantages, label: 'Преимущества', icon: Sparkles },
  { to: ROUTES.dashboard.banner, label: 'Баннер', icon: ImageIcon },
  { to: ROUTES.dashboard.products, label: 'Продукты', icon: Package },
  { to: ROUTES.dashboard.chatDemo, label: 'Чат (демо)', icon: MessageSquare },
  { to: ROUTES.dashboard.leads, label: 'Заявки', icon: Users },
  { to: ROUTES.dashboard.settings, label: 'Профиль', icon: Settings },
]
