import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { VideoCard } from '@/components/video-card/VideoCard'
import type { Video, VideoCategory } from '@/entities/video'
import type { PublicVideo } from '@/shared/api/types'
import { videoCategoryLabel } from '@/shared/lib/video-labels'

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

export interface DemoVideosSectionProps {
  videos: PublicVideo[]
}

export function DemoVideosSection({ videos }: DemoVideosSectionProps) {
  const [filter, setFilter] = useState<VideoCategory | 'all'>('all')

  const list = useMemo(() => {
    if (filter === 'all') return videos
    return videos.filter((v) => v.category === filter)
  }, [filter, videos])

  return (
    <section id="demo-videos" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Демо видео
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Наведите на карточку — автопревью. Фильтры по категориям.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <VideoCard
                  video={toVideo(video)}
                  onUse={() =>
                    window.alert(
                      `Демо: «${video.title}» (${videoCategoryLabel(video.category)})`,
                    )
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 ? (
          <p className="mt-8 text-center text-zinc-500">Нет роликов в категории</p>
        ) : null}
      </div>
    </section>
  )
}
