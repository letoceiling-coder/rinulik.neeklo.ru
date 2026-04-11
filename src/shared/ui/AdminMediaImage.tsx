import { useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '@/shared/api/client'
import { useAuthStore } from '@/app/store/useAuthStore'

function apiOrigin(): string {
  const b = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
  if (b) return b
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

/**
 * Админ-превью: внешние и blob — как есть. `/uploads/…` — сначала публичный URL (nginx → Node),
 * при ошибке — один запрос к `/api/admin/media/raw` с Bearer.
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
  const blobRef = useRef<string | null>(null)
  const triedRawRef = useRef(false)

  useEffect(() => {
    triedRawRef.current = false
    if (blobRef.current) {
      URL.revokeObjectURL(blobRef.current)
      blobRef.current = null
    }
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
    setFailed(false)
    setSrc(assetUrl(url))
  }, [url])

  useEffect(
    () => () => {
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current)
        blobRef.current = null
      }
    },
    [],
  )

  const loadRawBlob = useCallback(() => {
    const raw = `${apiOrigin()}/api/admin/media/raw?${new URLSearchParams({ url })}`
    const token = useAuthStore.getState().token
    return fetch(raw, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.blob()
    })
  }, [url])

  const onImgError = useCallback(() => {
    if (!url.startsWith('/uploads/')) {
      setFailed(true)
      return
    }
    if (triedRawRef.current) {
      setFailed(true)
      return
    }
    triedRawRef.current = true
    void loadRawBlob()
      .then((blob) => {
        if (blobRef.current) URL.revokeObjectURL(blobRef.current)
        const u = URL.createObjectURL(blob)
        blobRef.current = u
        setSrc(u)
      })
      .catch(() => setFailed(true))
  }, [url, loadRawBlob])

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-xs text-zinc-500 ${className ?? ''}`}
        title="Нет файла на сервере — в «Видео» замените постер или перезалейте ролик"
      >
        нет превью
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={onImgError}
    />
  )
}
