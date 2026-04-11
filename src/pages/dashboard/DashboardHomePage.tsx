import { useEffect, useState } from 'react'
import { DashboardCard } from '@/components/dashboard-card/DashboardCard'
import { apiFetch } from '@/shared/api/client'
import { Package, Users, Video } from 'lucide-react'

interface Stats {
  videos: number
  leads: number
  services: number
  tariffs: number
  products: number
}

export function DashboardHomePage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await apiFetch<Stats>('/api/admin/stats')
        if (!cancelled) setStats(s)
      } catch {
        if (!cancelled) setStats(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Главная</h1>
      <p className="mt-1 text-sm text-zinc-500">Сводка по контенту и заявкам</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Видео"
          value={stats?.videos ?? '—'}
          icon={Video}
          loading={!stats}
        />
        <DashboardCard
          title="Заявки"
          value={stats?.leads ?? '—'}
          icon={Users}
          loading={!stats}
        />
        <DashboardCard
          title="Услуги"
          value={stats?.services ?? '—'}
          icon={Package}
          loading={!stats}
        />
        <DashboardCard
          title="Тарифы"
          value={stats?.tariffs ?? '—'}
          hint="Продукты в отдельном разделе"
          loading={!stats}
        />
      </div>
    </div>
  )
}
