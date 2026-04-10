import { VideoCard } from '@/components/video-card/VideoCard'
import { MOCK_VIDEOS } from '@/shared/mocks/videos'

const MY = MOCK_VIDEOS.slice(0, 3)

export function DashboardVideosPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Мои видео</h1>
      <p className="mt-1 text-sm text-zinc-500">Черновики и готовые ролики (mock)</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {MY.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onUse={() => window.alert('Открыть в редакторе (mock)')}
          />
        ))}
      </div>
    </div>
  )
}
