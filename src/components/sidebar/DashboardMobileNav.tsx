import { NavLink } from 'react-router-dom'
import { DASHBOARD_NAV } from '@/shared/config/dashboard-nav'
import { cn } from '@/shared/lib/cn'

const pillClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
    isActive
      ? 'bg-violet-500/25 text-violet-100'
      : 'bg-white/5 text-zinc-400 hover:text-zinc-100',
  )

export function DashboardMobileNav() {
  return (
    <div className="border-b border-white/10 bg-zinc-950/95 px-3 py-2 md:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DASHBOARD_NAV.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={pillClass}>
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
