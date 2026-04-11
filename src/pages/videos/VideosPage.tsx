import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { VideoCard } from '@/components/video-card/VideoCard'
import type { Video, VideoCategory } from '@/entities/video'
import { apiFetch } from '@/shared/api/client'
import type { PublicVideo } from '@/shared/api/types'
import { videoCategoryLabel } from '@/shared/lib/video-labels'
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

function toVideo(v: PublicVideo): Video {
  return {
    id: v.id,
    title: v.title,
    category: v.category as VideoCategory,
    posterSrc: v.posterSrc,
    previewSrc: v.previewSrc,
  }
}

export function VideosPage() {
  const [params, setParams] = useSearchParams()
  const filter = (params.get('category') as VideoCategory | 'all' | null) ?? 'all'
  const [debouncedQ, setDebouncedQ] = useState('')
  const [input, setInput] = useState('')
  const [videos, setVideos] = useState<PublicVideo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(input.trim()), 400)
    return () => window.clearTimeout(t)
  }, [input])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (filter !== 'all') qs.set('category', filter)
        if (debouncedQ) qs.set('q', debouncedQ)
        const res = await apiFetch<{ videos: PublicVideo[] }>(
          `/api/public/videos?${qs.toString()}`,
        )
        if (!cancelled) {
          setVideos(res.videos)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Ошибка')
          setVideos([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [filter, debouncedQ])

  const list = useMemo(() => videos ?? [], [videos])

  function setFilter(next: VideoCategory | 'all') {
    const p = new URLSearchParams(params)
    if (next === 'all') p.delete('category')
    else p.set('category', next)
    setParams(p, { replace: true })
  }

  return (
    <main className="min-h-dvh px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Галерея видео
        </h1>
        <p className="mt-1 text-zinc-500">Данные с API · фильтры и поиск</p>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Поиск по названию или категории…"
            className="max-w-md"
          />
        </div>
        {error ? <p className="mt-6 text-red-400">{error}</p> : null}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="mt-16 rounded-xl border border-dashed border-white/15 bg-zinc-900/40 py-16 text-center text-zinc-500">
            Ничего не найдено
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((video) => (
              <VideoCard
                key={video.id}
                video={toVideo(video)}
                onUse={() =>
                  window.alert(
                    `Выбрано: ${video.title} (${videoCategoryLabel(video.category)})`,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
