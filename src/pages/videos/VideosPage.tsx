import { useEffect, useMemo, useState } from 'react'
import { VideoCard } from '@/components/video-card/VideoCard'
import type { VideoCategory } from '@/entities/video'
import { videoCategoryLabel } from '@/shared/lib/video-labels'
import { MOCK_VIDEOS } from '@/shared/mocks/videos'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'

const FILTERS: { id: VideoCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ad', label: 'Реклама' },
  { id: 'business', label: 'Бизнес' },
  { id: 'entertainment', label: 'Развлечения' },
  { id: 'gifts', label: 'Подарки' },
  { id: 'products', label: 'Товары' },
]

export function VideosPage() {
  const [filter, setFilter] = useState<VideoCategory | 'all'>('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450)
    return () => window.clearTimeout(t)
  }, [])

  const list = useMemo(() => {
    let v = MOCK_VIDEOS
    if (filter !== 'all') v = v.filter((x) => x.category === filter)
    if (q.trim()) {
      const n = q.trim().toLowerCase()
      v = v.filter(
        (x) =>
          x.title.toLowerCase().includes(n) ||
          videoCategoryLabel(x.category).toLowerCase().includes(n),
      )
    }
    return v
  }, [filter, q])

  return (
    <main className="min-h-dvh px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Галерея видео
        </h1>
        <p className="mt-1 text-zinc-500">Фильтры, поиск, превью по наведению</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию или категории…"
            className="max-w-md"
          />
        </div>
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="mt-16 rounded-xl border border-dashed border-white/15 bg-zinc-900/40 py-16 text-center text-zinc-500">
            Ничего не найдено — сбросьте фильтр или запрос
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onUse={() =>
                  window.alert(`Шаблон: ${video.title}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
