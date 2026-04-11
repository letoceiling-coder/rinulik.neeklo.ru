import { useEffect, useState } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'

function apiOrigin(): string {
  const b = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  if (b) return b
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/** Видео из `/uploads/...` в админке: blob URL через `GET /api/admin/media/raw` + Bearer. */
export function AdminMediaVideo({ url, className }: { url: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!url) {
      setSrc(null)
      setFailed(true)
      return
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      setSrc(url)
      setFailed(false)
      return
    }
    if (!url.startsWith('/uploads/')) {
      setSrc(url)
      setFailed(false)
      return
    }

    let alive = true
    let blobUrl: string | null = null
    setFailed(false)
    setSrc(null)

    const raw = `${apiOrigin()}/api/admin/media/raw?${new URLSearchParams({ url })}`
    const token = useAuthStore.getState().token
    fetch(raw, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.blob()
      })
      .then((blob) => {
        if (!alive) return
        blobUrl = URL.createObjectURL(blob)
        setSrc(blobUrl)
      })
      .catch(() => {
        if (alive) setFailed(true)
      })

    return () => {
      alive = false
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [url])

  if (failed || !src) {
    return (
      <div
        className={`flex min-h-32 items-center justify-center bg-zinc-800 text-xs text-zinc-500 ${className ?? ''}`}
        title="Нет файла или нет доступа"
      >
        нет превью видео
      </div>
    )
  }

  return <video src={src} className={className} controls playsInline preload="metadata" />
}
