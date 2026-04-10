import { motion, useReducedMotion } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import type { Video } from '@/entities/video'
import { videoCategoryLabel } from '@/shared/lib/video-labels'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

export interface VideoCardProps {
  video: Video
  onUse?: (video: Video) => void
  className?: string
}

export function VideoCard({ video, onUse, className }: VideoCardProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const reduceMotion = useReducedMotion()

  const play = useCallback(() => {
    void ref.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    if (ref.current) {
      ref.current.pause()
      ref.current.currentTime = 0
    }
  }, [])

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={className}
    >
      <Card
        className="group overflow-hidden border-white/10 bg-zinc-900/40 transition-shadow hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-950/30"
        onMouseEnter={play}
        onMouseLeave={pause}
        onFocus={play}
        onBlur={pause}
      >
        <div className="relative aspect-video bg-zinc-950">
          <img
            src={video.posterSrc}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-100'}`}
          />
          <video
            ref={ref}
            src={video.previewSrc}
            className="size-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.posterSrc}
            onLoadedData={() => setLoaded(true)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-violet-400/90">
              {videoCategoryLabel(video.category)}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-100">
              {video.title}
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            type="button"
            onClick={() => onUse?.(video)}
          >
            Использовать
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
