import { NavLink } from 'react-router-dom'
import { DASHBOARD_NAV } from '@/shared/config/dashboard-nav'
import { cn } from '@/shared/lib/cn'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-violet-500/15 text-violet-200'
      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
  )

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-zinc-950/90 md:flex">
      <div className="flex h-14 items-center border-b border-white/10 px-4 text-sm font-semibold text-white">
        Кабинет
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {DASHBOARD_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
