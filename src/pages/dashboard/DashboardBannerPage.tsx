import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch, apiUploadForm, assetUrl } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface Banner {
  headline: string
  subheadline: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  ctaBoxTitle: string
  ctaBoxSubtitle: string
  previewImageUrl: string | null
  heroVideoUrl: string | null
}

export function DashboardBannerPage() {
  const [b, setB] = useState<Banner | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clearVideo, setClearVideo] = useState(false)
  const [externalVideoUrl, setExternalVideoUrl] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const load = useCallback(async () => {
    const data = await apiFetch<Banner>('/api/admin/banner')
    setB(data)
    setClearVideo(false)
    setExternalVideoUrl('')
    setError(null)
  }, [])

  useEffect(() => {
    void load().catch(() => setB(null))
  }, [load])

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!b) return
    setError(null)
    const fd = new FormData()
    fd.set('headline', b.headline)
    fd.set('subheadline', b.subheadline)
    fd.set('ctaPrimaryLabel', b.ctaPrimaryLabel)
    fd.set('ctaPrimaryHref', b.ctaPrimaryHref)
    fd.set('ctaSecondaryLabel', b.ctaSecondaryLabel)
    fd.set('ctaSecondaryHref', b.ctaSecondaryHref)
    fd.set('ctaBoxTitle', b.ctaBoxTitle)
    fd.set('ctaBoxSubtitle', b.ctaBoxSubtitle)
    const form = formRef.current
    const previewFile = (form?.elements.namedItem('previewImage') as HTMLInputElement | null)?.files?.[0]
    const heroFile = (form?.elements.namedItem('heroVideo') as HTMLInputElement | null)?.files?.[0]
    if (previewFile) fd.append('previewImage', previewFile)
    if (heroFile) fd.append('heroVideo', heroFile)
    if (clearVideo) {
      fd.set('clearHeroVideo', '1')
    } else if (externalVideoUrl.trim() && !heroFile) {
      fd.set('heroVideoUrl', externalVideoUrl.trim())
    }
    setBusy(true)
    try {
      const updated = await apiUploadForm<Banner>('/api/admin/banner', fd, 'PATCH')
      setB(updated)
      setClearVideo(false)
      setExternalVideoUrl('')
      formRef.current?.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setBusy(false)
    }
  }

  if (!b) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-zinc-500">Баннер не найден. Выполните сид базы.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Баннер главной</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Тексты и кнопки героя, превью-картинка (постер) и опционально фоновое видео в правой плитке.
      </p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      <form
        ref={formRef}
        onSubmit={save}
        className="mt-6 max-w-2xl space-y-4 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
      >
        <Input
          value={b.headline}
          onChange={(e) => setB({ ...b, headline: e.target.value })}
          placeholder="Заголовок"
        />
        <textarea
          value={b.subheadline}
          onChange={(e) => setB({ ...b, subheadline: e.target.value })}
          placeholder="Подзаголовок"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={b.ctaPrimaryLabel}
            onChange={(e) => setB({ ...b, ctaPrimaryLabel: e.target.value })}
            placeholder="CTA 1 текст"
          />
          <Input
            value={b.ctaPrimaryHref}
            onChange={(e) => setB({ ...b, ctaPrimaryHref: e.target.value })}
            placeholder="CTA 1 ссылка (#якорь или /путь)"
          />
          <Input
            value={b.ctaSecondaryLabel}
            onChange={(e) => setB({ ...b, ctaSecondaryLabel: e.target.value })}
            placeholder="CTA 2 текст"
          />
          <Input
            value={b.ctaSecondaryHref}
            onChange={(e) => setB({ ...b, ctaSecondaryHref: e.target.value })}
            placeholder="CTA 2 ссылка"
          />
        </div>
        <Input
          value={b.ctaBoxTitle}
          onChange={(e) => setB({ ...b, ctaBoxTitle: e.target.value })}
          placeholder="Заголовок блока заявки"
        />
        <textarea
          value={b.ctaBoxSubtitle}
          onChange={(e) => setB({ ...b, ctaBoxSubtitle: e.target.value })}
          placeholder="Подзаголовок блока заявки"
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />

        <div className="space-y-2 rounded-lg border border-white/5 bg-zinc-950/50 p-3">
          <p className="text-xs font-medium text-zinc-400">Превью справа в герое</p>
          <label className="block text-xs text-zinc-500">
            Картинка-постер (JPEG/PNG/WebP). Для видео постер показывается до загрузки и как обложка.
            <input type="file" name="previewImage" accept="image/*" className="mt-1 block w-full text-sm" />
          </label>
          {b.previewImageUrl ? (
            <img
              src={assetUrl(b.previewImageUrl)}
              alt=""
              className="max-h-36 rounded-lg border border-white/10 object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-2 rounded-lg border border-white/5 bg-zinc-950/50 p-3">
          <p className="text-xs font-medium text-zinc-400">Видео в плитке героя</p>
          <p className="text-xs text-zinc-500">
            Загрузите файл (MP4/WebM) или укажите прямую ссылку. Файл при сохранении заменит ссылку.
            Чтобы убрать видео, отметьте «Удалить видео» и сохраните.
          </p>
          <label className="block text-xs text-zinc-500">
            Файл видео
            <input type="file" name="heroVideo" accept="video/mp4,video/webm,video/*" className="mt-1 block w-full text-sm" />
          </label>
          <Input
            value={externalVideoUrl}
            onChange={(e) => setExternalVideoUrl(e.target.value)}
            placeholder="Или внешний URL видео (https://…)"
            className="text-sm"
          />
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={clearVideo}
              onChange={(e) => setClearVideo(e.target.checked)}
              className="rounded border-white/20"
            />
            Удалить видео с баннера
          </label>
          {b.heroVideoUrl ? (
            <p className="text-xs text-zinc-500">
              Сейчас:{' '}
              <a href={assetUrl(b.heroVideoUrl)} className="text-violet-400 underline" target="_blank" rel="noreferrer">
                открыть
              </a>
            </p>
          ) : (
            <p className="text-xs text-zinc-600">Видео не задано — показывается только картинка или плейсхолдер.</p>
          )}
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </form>
    </div>
  )
}
