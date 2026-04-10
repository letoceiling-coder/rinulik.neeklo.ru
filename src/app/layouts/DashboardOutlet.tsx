import { Outlet } from 'react-router-dom'
import { DashboardMobileNav } from '@/components/sidebar/DashboardMobileNav'
import { Sidebar } from '@/components/sidebar/Sidebar'

/**
 * Шаг 2: shell с сайдбаром и мобильной навигацией.
 */
export function DashboardOutlet() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100 md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardMobileNav />
        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
