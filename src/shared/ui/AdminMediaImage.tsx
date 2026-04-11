import { useEffect, useState } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'

function apiOrigin(): string {
  const b = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  if (b) return b
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/**
 * Превью файлов из `/uploads/...` в админке: запрос с Bearer, обход 404 nginx без proxy на /uploads.
 */
export function AdminMediaImage({
  url,
  alt,
  className,
}: {
  url: string
  alt: string
  className?: string
}) {
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
        className={`flex items-center justify-center bg-zinc-800 text-xs text-zinc-500 ${className ?? ''}`}
        title="Нет файла или нет доступа"
      >
        нет превью
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} loading="lazy" />
}
