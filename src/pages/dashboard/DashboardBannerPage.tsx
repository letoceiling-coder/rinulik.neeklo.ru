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

interface MediaLibFile {
  url: string
  kind: 'image' | 'video'
  folder: string
}

interface CatalogVideo {
  id: string
  title: string
  posterUrl: string
  videoUrl: string
}

interface MediaLibraryPayload {
  files: MediaLibFile[]
  catalog: CatalogVideo[]
}

type PickerMode = 'poster' | 'video' | null

export function DashboardBannerPage() {
  const [b, setB] = useState<Banner | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clearVideo, setClearVideo] = useState(false)
  const [externalVideoUrl, setExternalVideoUrl] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [pickerOpen, setPickerOpen] = useState<PickerMode>(null)
  const [lib, setLib] = useState<MediaLibraryPayload | null>(null)
  const [libError, setLibError] = useState<string | null>(null)
  const [libLoading, setLibLoading] = useState(false)

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

  async function openPicker(mode: Exclude<PickerMode, null>) {
    setPickerOpen(mode)
    setLib(null)
    setLibError(null)
    setLibLoading(true)
    try {
      const data = await apiFetch<MediaLibraryPayload>('/api/admin/media/library')
      setLib(data)
    } catch (e) {
      setLibError(e instanceof Error ? e.message : 'Не удалось загрузить медиатеку')
    } finally {
      setLibLoading(false)
    }
  }

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
    else if (b.previewImageUrl?.trim()) fd.set('previewImageUrl', b.previewImageUrl.trim())
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

  const posterFiles = lib?.files.filter((f) => f.kind === 'image') ?? []
  const videoFiles = lib?.files.filter((f) => f.kind === 'video') ?? []

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Баннер главной</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Тексты и кнопки героя, превью-картинка (постер) и опционально фоновое видео. Медиатека подставляет уже
        загруженные файлы (раздел «Видео», «Продукты», прошлые загрузки баннера).
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
          <p className="text-xs text-zinc-500">
            Картинка-постер для плитки и обложка HTML5-video. Можно загрузить новый файл или выбрать из медиатеки.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="block text-xs text-zinc-500">
              Новый файл
              <input type="file" name="previewImage" accept="image/*" className="mt-1 block w-full text-sm" />
            </label>
            <Button type="button" variant="secondary" size="sm" className="self-end" onClick={() => void openPicker('poster')}>
              Медиатека: картинка
            </Button>
          </div>
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
            Новый файл, прямая ссылка или выбор уже загруженного ролика из каталога «Видео» / папки uploads.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="block text-xs text-zinc-500">
              Новый файл
              <input type="file" name="heroVideo" accept="video/mp4,video/webm,video/*" className="mt-1 block w-full text-sm" />
            </label>
            <Button type="button" variant="secondary" size="sm" className="self-end" onClick={() => void openPicker('video')}>
              Медиатека: видео
            </Button>
          </div>
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

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/75"
            aria-label="Закрыть"
            onClick={() => setPickerOpen(null)}
          />
          <div className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">
                {pickerOpen === 'poster' ? 'Выбор постера' : 'Выбор видео'}
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(null)}>
                Закрыть
              </Button>
            </div>
            <div className="max-h-[calc(88vh-52px)] overflow-y-auto p-4">
              {libLoading ? <p className="text-sm text-zinc-500">Загрузка…</p> : null}
              {libError ? <p className="text-sm text-red-400">{libError}</p> : null}
              {lib && pickerOpen === 'poster' ? (
                <>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Каталог видео (постеры)</p>
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {lib.catalog.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-left transition hover:border-violet-500/50"
                        onClick={() => {
                          setB((prev) => (prev ? { ...prev, previewImageUrl: v.posterUrl } : prev))
                          setPickerOpen(null)
                        }}
                      >
                        <img src={assetUrl(v.posterUrl)} alt="" className="aspect-video w-full object-cover" />
                        <span className="line-clamp-2 block p-2 text-xs text-zinc-300">{v.title}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Файлы (posters, banner, products)</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {posterFiles.map((f) => (
                      <button
                        key={f.url}
                        type="button"
                        className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-left text-[10px] text-zinc-500 hover:border-violet-500/50"
                        onClick={() => {
                          setB((prev) => (prev ? { ...prev, previewImageUrl: f.url } : prev))
                          setPickerOpen(null)
                        }}
                      >
                        <img src={assetUrl(f.url)} alt="" className="aspect-square w-full object-cover" />
                        <span className="block truncate p-1">{f.folder}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
              {lib && pickerOpen === 'video' ? (
                <>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Каталог видео</p>
                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {lib.catalog.map((v) => (
                      <div
                        key={v.id}
                        className="flex gap-3 rounded-lg border border-white/10 bg-zinc-950 p-2"
                      >
                        <img src={assetUrl(v.posterUrl)} alt="" className="size-20 shrink-0 rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200">{v.title}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="mt-2"
                            onClick={() => {
                              setExternalVideoUrl(v.videoUrl)
                              setClearVideo(false)
                              setPickerOpen(null)
                            }}
                          >
                            Использовать ролик
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Файлы (videos, banner)</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {videoFiles.map((f) => (
                      <button
                        key={f.url}
                        type="button"
                        className="rounded-lg border border-white/10 bg-zinc-950 p-3 text-left hover:border-violet-500/50"
                        onClick={() => {
                          setExternalVideoUrl(f.url)
                          setClearVideo(false)
                          setPickerOpen(null)
                        }}
                      >
                        <p className="text-xs text-violet-300">{f.folder}</p>
                        <p className="mt-1 truncate text-[10px] text-zinc-500">{f.url}</p>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
