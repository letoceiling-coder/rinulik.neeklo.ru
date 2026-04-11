import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch, apiUploadForm } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface AdminVideo {
  id: string
  title: string
  category: string
  posterUrl: string
  videoUrl: string
  published: boolean
  sortOrder: number
}

const CATS = ['ad', 'business', 'entertainment', 'gifts', 'products'] as const

const MAX_POSTER_W = 1280

export function DashboardVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('ad')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [seekSec, setSeekSec] = useState(0)
  const [framePosterFile, setFramePosterFile] = useState<File | null>(null)
  const [frameThumbUrl, setFrameThumbUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    const r = await apiFetch<{ videos: AdminVideo[] }>('/api/admin/videos')
    setVideos(r.videos)
  }, [])

  useEffect(() => {
    void load().catch(() => setVideos([]))
  }, [load])

  useEffect(() => {
    return () => {
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl)
      if (frameThumbUrl) URL.revokeObjectURL(frameThumbUrl)
    }
  }, [videoObjectUrl, frameThumbUrl])

  function onVideoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl)
    if (frameThumbUrl) URL.revokeObjectURL(frameThumbUrl)
    setFramePosterFile(null)
    setFrameThumbUrl(null)
    setDuration(0)
    setSeekSec(0)
    if (!f) {
      setVideoObjectUrl(null)
      return
    }
    setVideoObjectUrl(URL.createObjectURL(f))
  }

  function onVideoMeta() {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return
    setDuration(v.duration)
    const t = Math.min(0.5, v.duration * 0.05)
    setSeekSec(t)
    v.currentTime = t
  }

  function captureFrameAtCurrentTime() {
    const v = videoRef.current
    if (!v || v.readyState < 2) return
    const w = v.videoWidth
    const h = v.videoHeight
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    const scale = Math.min(1, MAX_POSTER_W / w)
    canvas.width = Math.max(1, Math.floor(w * scale))
    canvas.height = Math.max(1, Math.floor(h * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        if (frameThumbUrl) URL.revokeObjectURL(frameThumbUrl)
        const file = new File([blob], 'poster-from-video.jpg', { type: 'image/jpeg' })
        setFramePosterFile(file)
        setFrameThumbUrl(URL.createObjectURL(blob))
      },
      'image/jpeg',
      0.88,
    )
  }

  function useFrameFromSlider() {
    const v = videoRef.current
    if (!v || !videoObjectUrl) return
    const target = Math.min(Math.max(0, seekSec), v.duration || 0)
    if (Math.abs(v.currentTime - target) < 0.04) {
      captureFrameAtCurrentTime()
      return
    }
    v.currentTime = target
    const once = () => {
      v.removeEventListener('seeked', once)
      captureFrameAtCurrentTime()
    }
    v.addEventListener('seeked', once)
  }

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = formRef.current
    if (!form) return
    const videoEl = form.elements.namedItem('video') as HTMLInputElement | null
    const posterEl = form.elements.namedItem('poster') as HTMLInputElement | null
    const vid = videoEl?.files?.[0]
    if (!vid) {
      setError('Выберите файл видео')
      return
    }
    const manualPoster = posterEl?.files?.[0]
    if (!framePosterFile && !manualPoster) {
      setError('Загрузите постер или выберите кадр из видео')
      return
    }
    const fd = new FormData()
    fd.set('title', title.trim())
    fd.set('category', category)
    fd.append('video', vid)
    if (framePosterFile) fd.append('poster', framePosterFile, framePosterFile.name)
    else if (manualPoster) fd.append('poster', manualPoster)
    setBusy(true)
    try {
      await apiUploadForm('/api/admin/videos', fd, 'POST')
      form.reset()
      setTitle('')
      setCategory('ad')
      if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl)
      if (frameThumbUrl) URL.revokeObjectURL(frameThumbUrl)
      setVideoObjectUrl(null)
      setFramePosterFile(null)
      setFrameThumbUrl(null)
      setDuration(0)
      setSeekSec(0)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить видео и файлы с диска?')) return
    await apiFetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Видео</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Файл видео обязателен. Постер — отдельная картинка или кадр из выбранного ролика (ползунок времени + кнопка).
      </p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      <form
        ref={formRef}
        className="mt-6 max-w-xl space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
        onSubmit={onUpload}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100"
        >
          {CATS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="block text-xs text-zinc-500">
          Видео (обязательно)
          <input
            type="file"
            name="video"
            accept="video/*"
            required
            className="mt-1 block w-full text-sm"
            onChange={onVideoFileChange}
          />
        </label>

        {videoObjectUrl ? (
          <div className="space-y-2 rounded-lg border border-white/10 bg-zinc-950/60 p-3">
            <p className="text-xs font-medium text-zinc-400">Кадр для постера</p>
            <video
              ref={videoRef}
              src={videoObjectUrl}
              className="max-h-48 w-full rounded-md border border-white/10 bg-black object-contain"
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={onVideoMeta}
            />
            {duration > 0 ? (
              <>
                <label className="block text-xs text-zinc-500">
                  Момент времени: {seekSec.toFixed(2)} с / {duration.toFixed(1)} с
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    step={duration > 120 ? 0.25 : 0.05}
                    value={seekSec}
                    onChange={(e) => {
                      const t = Number(e.target.value)
                      setSeekSec(t)
                      const v = videoRef.current
                      if (v) v.currentTime = t
                    }}
                    className="mt-1 block w-full accent-violet-500"
                  />
                </label>
                <Button type="button" variant="secondary" size="sm" onClick={useFrameFromSlider}>
                  Сделать постер из этого кадра
                </Button>
              </>
            ) : (
              <p className="text-xs text-zinc-600">Загрузка метаданных видео…</p>
            )}
            {frameThumbUrl ? (
              <div className="flex items-start gap-3 pt-1">
                <img src={frameThumbUrl} alt="" className="h-20 w-auto rounded border border-white/10 object-cover" />
                <p className="text-xs text-zinc-400">Этот кадр будет отправлен как постер при «Добавить».</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <label className="block text-xs text-zinc-500">
          Постер файлом (если не используете кадр из видео)
          <input type="file" name="poster" accept="image/*" className="mt-1 block w-full text-sm" />
        </label>

        <Button type="submit" disabled={busy}>
          {busy ? 'Загрузка…' : 'Добавить'}
        </Button>
      </form>
      <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10">
        {videos.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
            <span className="font-medium text-zinc-100">{v.title}</span>
            <span className="text-zinc-500">{v.category}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => void remove(v.id)}>
              Удалить
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
