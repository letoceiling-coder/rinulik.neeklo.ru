import { useCallback, useEffect, useState } from 'react'
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

export function DashboardVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('ad')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await apiFetch<{ videos: AdminVideo[] }>('/api/admin/videos')
    setVideos(r.videos)
  }, [])

  useEffect(() => {
    void load().catch(() => setVideos([]))
  }, [load])

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('title', title.trim())
    fd.set('category', category)
    setBusy(true)
    try {
      await apiUploadForm('/api/admin/videos', fd, 'POST')
      e.currentTarget.reset()
      setTitle('')
      setCategory('ad')
      await load()
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
      <p className="mt-1 text-sm text-zinc-500">Загрузка постера и ролика (multipart)</p>
      <form
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
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs text-zinc-500">
            Постер
            <input type="file" name="poster" accept="image/*" required className="mt-1 block w-full text-sm" />
          </label>
          <label className="text-xs text-zinc-500">
            Видео
            <input type="file" name="video" accept="video/*" required className="mt-1 block w-full text-sm" />
          </label>
        </div>
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
