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

const MAX_POSTER_W = 1280

export function DashboardBannerPage() {
  const [b, setB] = useState<Banner | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clearVideo, setClearVideo] = useState(false)
  const [advancedVideoUrl, setAdvancedVideoUrl] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [pickerOpen, setPickerOpen] = useState<PickerMode>(null)
  const [lib, setLib] = useState<MediaLibraryPayload | null>(null)
  const [libError, setLibError] = useState<string | null>(null)
  const [libLoading, setLibLoading] = useState(false)

  /** Новые файлы к следующему сохранению (из модалки «видео» или загрузки постера) */
  const [pendingHeroVideo, setPendingHeroVideo] = useState<File | null>(null)
  const [pendingPreviewImage, setPendingPreviewImage] = useState<File | null>(null)
  const [pendingPreviewThumb, setPendingPreviewThumb] = useState<string | null>(null)
  /** Выбранный из медиатеки URL ролика (уже на сервере) */
  const [heroVideoLibraryUrl, setHeroVideoLibraryUrl] = useState<string | null>(null)

  const modalVideoRef = useRef<HTMLVideoElement>(null)
  const [modalVideoFile, setModalVideoFile] = useState<File | null>(null)
  const [modalVideoObjectUrl, setModalVideoObjectUrl] = useState<string | null>(null)
  const [modalDuration, setModalDuration] = useState(0)
  const [modalSeekSec, setModalSeekSec] = useState(0)
  const [modalFramePoster, setModalFramePoster] = useState<File | null>(null)
  const [modalFrameThumb, setModalFrameThumb] = useState<string | null>(null)
  const [modalExtraPoster, setModalExtraPoster] = useState<File | null>(null)
  const [modalExtraThumb, setModalExtraThumb] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await apiFetch<Banner>('/api/admin/banner')
    setB(data)
    setClearVideo(false)
    setAdvancedVideoUrl('')
    setError(null)
  }, [])

  useEffect(() => {
    void load().catch(() => setB(null))
  }, [load])

  useEffect(() => {
    if (!pendingPreviewImage) {
      setPendingPreviewThumb((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(pendingPreviewImage)
    setPendingPreviewThumb((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pendingPreviewImage])

  useEffect(() => {
    return () => {
      if (modalVideoObjectUrl) URL.revokeObjectURL(modalVideoObjectUrl)
      if (modalFrameThumb) URL.revokeObjectURL(modalFrameThumb)
      if (modalExtraThumb) URL.revokeObjectURL(modalExtraThumb)
    }
  }, [modalVideoObjectUrl, modalFrameThumb, modalExtraThumb])

  function resetVideoModalUpload() {
    if (modalVideoObjectUrl) URL.revokeObjectURL(modalVideoObjectUrl)
    if (modalFrameThumb) URL.revokeObjectURL(modalFrameThumb)
    if (modalExtraThumb) URL.revokeObjectURL(modalExtraThumb)
    setModalVideoFile(null)
    setModalVideoObjectUrl(null)
    setModalDuration(0)
    setModalSeekSec(0)
    setModalFramePoster(null)
    setModalFrameThumb(null)
    setModalExtraPoster(null)
    setModalExtraThumb(null)
  }

  async function openPicker(mode: Exclude<PickerMode, null>) {
    setPickerOpen(mode)
    setLib(null)
    setLibError(null)
    setLibLoading(true)
    if (mode === 'video') resetVideoModalUpload()
    try {
      const data = await apiFetch<MediaLibraryPayload>('/api/admin/media/library')
      setLib(data)
    } catch (e) {
      setLibError(e instanceof Error ? e.message : 'Не удалось загрузить медиатеку')
    } finally {
      setLibLoading(false)
    }
  }

  function onModalVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    resetVideoModalUpload()
    if (!f) return
    setModalVideoFile(f)
    setModalVideoObjectUrl(URL.createObjectURL(f))
  }

  function onModalVideoMeta() {
    const v = modalVideoRef.current
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return
    setModalDuration(v.duration)
    const t = Math.min(0.5, v.duration * 0.05)
    setModalSeekSec(t)
    v.currentTime = t
  }

  function captureModalFrame() {
    const v = modalVideoRef.current
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
        if (modalFrameThumb) URL.revokeObjectURL(modalFrameThumb)
        const file = new File([blob], 'banner-poster-from-video.jpg', { type: 'image/jpeg' })
        setModalFramePoster(file)
        setModalFrameThumb(URL.createObjectURL(blob))
        setModalExtraPoster(null)
        if (modalExtraThumb) {
          URL.revokeObjectURL(modalExtraThumb)
          setModalExtraThumb(null)
        }
      },
      'image/jpeg',
      0.88,
    )
  }

  function useModalFrameFromSlider() {
    const v = modalVideoRef.current
    if (!v || !modalVideoObjectUrl) return
    const target = Math.min(Math.max(0, modalSeekSec), v.duration || 0)
    if (Math.abs(v.currentTime - target) < 0.04) {
      captureModalFrame()
      return
    }
    v.currentTime = target
    const once = () => {
      v.removeEventListener('seeked', once)
      captureModalFrame()
    }
    v.addEventListener('seeked', once)
  }

  function onModalExtraPosterPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (modalExtraThumb) URL.revokeObjectURL(modalExtraThumb)
    setModalExtraPoster(f)
    setModalExtraThumb(URL.createObjectURL(f))
    setModalFramePoster(null)
    if (modalFrameThumb) {
      URL.revokeObjectURL(modalFrameThumb)
      setModalFrameThumb(null)
    }
  }

  function applyVideoModalToBanner() {
    if (modalVideoFile) {
      const poster = modalFramePoster || modalExtraPoster
      if (!poster) {
        setError('Выберите постер: кадр из видео или отдельный файл изображения')
        return
      }
      setPendingHeroVideo(modalVideoFile)
      setPendingPreviewImage(poster)
      setHeroVideoLibraryUrl(null)
      setClearVideo(false)
      setError(null)
      setPickerOpen(null)
      resetVideoModalUpload()
      return
    }
    setError('Загрузите файл видео или выберите ролик из каталога ниже')
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
    else if (pendingPreviewImage) fd.append('previewImage', pendingPreviewImage, pendingPreviewImage.name)
    else if (b.previewImageUrl?.trim()) fd.set('previewImageUrl', b.previewImageUrl.trim())

    if (clearVideo) {
      fd.set('clearHeroVideo', '1')
    } else {
      if (heroFile) fd.append('heroVideo', heroFile)
      else if (pendingHeroVideo) fd.append('heroVideo', pendingHeroVideo, pendingHeroVideo.name)
      else if (heroVideoLibraryUrl?.trim()) fd.set('heroVideoUrl', heroVideoLibraryUrl.trim())
      else if (advancedVideoUrl.trim()) fd.set('heroVideoUrl', advancedVideoUrl.trim())
    }

    setBusy(true)
    try {
      const updated = await apiUploadForm<Banner>('/api/admin/banner', fd, 'PATCH')
      setB(updated)
      setClearVideo(false)
      setAdvancedVideoUrl('')
      setPendingHeroVideo(null)
      setPendingPreviewImage(null)
      setHeroVideoLibraryUrl(null)
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

  const previewDisplaySrc =
    pendingPreviewThumb || (b.previewImageUrl ? assetUrl(b.previewImageUrl) : '')

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Баннер главной</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Постер и видео для плитки героя: загрузка файлов, выбор из медиатеки или в модалке «видео» — загрузка ролика с
        кадром-постером.
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
            Постер для плитки и обложка видео. Файл, медиатека или постер вместе с новым видео из модалки «Медиатека:
            видео».
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="block text-xs text-zinc-500">
              Загрузить картинку
              <input type="file" name="previewImage" accept="image/*" className="mt-1 block w-full text-sm" />
            </label>
            <Button type="button" variant="secondary" size="sm" className="self-end" onClick={() => void openPicker('poster')}>
              Медиатека: картинка
            </Button>
          </div>
          {pendingPreviewImage ? (
            <p className="text-xs text-violet-300">
              К сохранению: постер «{pendingPreviewImage.name}»{' '}
              <button type="button" className="text-zinc-500 underline" onClick={() => setPendingPreviewImage(null)}>
                сбросить файл
              </button>
            </p>
          ) : null}
          {previewDisplaySrc ? (
            <img src={previewDisplaySrc} alt="" className="max-h-36 rounded-lg border border-white/10 object-cover" />
          ) : null}
        </div>

        <div className="space-y-2 rounded-lg border border-white/5 bg-zinc-950/50 p-3">
          <p className="text-xs font-medium text-zinc-400">Видео в плитке героя</p>
          <p className="text-xs text-zinc-500">
            Откройте «Медиатека: видео» — там загрузка файла с выбором кадра или отдельного постера и каталог. Либо
            выберите файл ниже без модалки.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="block text-xs text-zinc-500">
              Загрузить видео (без модалки)
              <input type="file" name="heroVideo" accept="video/mp4,video/webm,video/*" className="mt-1 block w-full text-sm" />
            </label>
            <Button type="button" variant="secondary" size="sm" className="self-end" onClick={() => void openPicker('video')}>
              Медиатека: видео
            </Button>
          </div>
          {pendingHeroVideo ? (
            <p className="text-xs text-violet-300">
              К сохранению: видео «{pendingHeroVideo.name}»{' '}
              <button type="button" className="text-zinc-500 underline" onClick={() => setPendingHeroVideo(null)}>
                сбросить
              </button>
            </p>
          ) : null}
          {heroVideoLibraryUrl ? (
            <p className="text-xs text-violet-300">
              Выбран ролик из каталога{' '}
              <button type="button" className="text-zinc-500 underline" onClick={() => setHeroVideoLibraryUrl(null)}>
                сбросить
              </button>
            </p>
          ) : null}
          <details className="text-xs text-zinc-500">
            <summary className="cursor-pointer text-zinc-400">Дополнительно: внешний URL видео</summary>
            <Input
              value={advancedVideoUrl}
              onChange={(e) => {
                setAdvancedVideoUrl(e.target.value)
                if (e.target.value.trim()) {
                  setPendingHeroVideo(null)
                  setHeroVideoLibraryUrl(null)
                }
              }}
              placeholder="https://… (только если файл недоступен)"
              className="mt-2 text-sm"
            />
          </details>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={clearVideo}
              onChange={(e) => {
                setClearVideo(e.target.checked)
                if (e.target.checked) {
                  setPendingHeroVideo(null)
                  setHeroVideoLibraryUrl(null)
                  setAdvancedVideoUrl('')
                }
              }}
              className="rounded border-white/20"
            />
            Удалить видео с баннера
          </label>
          {b.heroVideoUrl && !clearVideo ? (
            <p className="text-xs text-zinc-500">
              Сейчас на сайте:{' '}
              <a href={assetUrl(b.heroVideoUrl)} className="text-violet-400 underline" target="_blank" rel="noreferrer">
                открыть
              </a>
            </p>
          ) : !b.heroVideoUrl ? (
            <p className="text-xs text-zinc-600">Видео не задано — только постер или плейсхолдер.</p>
          ) : null}
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
                {pickerOpen === 'poster' ? 'Выбор постера' : 'Видео для баннера'}
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPickerOpen(null)}>
                Закрыть
              </Button>
            </div>
            <div className="max-h-[calc(88vh-52px)] overflow-y-auto p-4">
              {libLoading ? <p className="text-sm text-zinc-500">Загрузка…</p> : null}
              {libError ? <p className="text-sm text-red-400">{libError}</p> : null}

              {pickerOpen === 'poster' ? (
                <>
                  <div className="mb-6 rounded-lg border border-white/10 bg-zinc-950/60 p-3">
                    <p className="mb-2 text-xs font-medium text-zinc-400">Загрузить с диска</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-zinc-300"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        setPendingPreviewImage(f)
                        setPickerOpen(null)
                      }}
                    />
                  </div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Каталог видео (постеры)</p>
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {lib?.catalog.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950 text-left transition hover:border-violet-500/50"
                        onClick={() => {
                          setB((prev) => (prev ? { ...prev, previewImageUrl: v.posterUrl } : prev))
                          setPendingPreviewImage(null)
                          setPickerOpen(null)
                        }}
                      >
                        <img src={assetUrl(v.posterUrl)} alt="" className="aspect-video w-full object-cover" loading="lazy" />
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
                          setPendingPreviewImage(null)
                          setPickerOpen(null)
                        }}
                      >
                        <img src={assetUrl(f.url)} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                        <span className="block truncate p-1">{f.folder}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              {pickerOpen === 'video' ? (
                <>
                  <div className="mb-6 rounded-lg border border-violet-500/20 bg-zinc-950/80 p-4">
                    <p className="text-xs font-medium text-violet-200">Загрузить новое видео</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Выберите файл, при необходимости выберите кадр или загрузите постер отдельно, затем «Применить к
                      баннеру».
                    </p>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      className="mt-2 block w-full text-sm"
                      onChange={onModalVideoPick}
                    />
                    {modalVideoObjectUrl ? (
                      <div className="mt-3 space-y-2">
                        <video
                          ref={modalVideoRef}
                          src={modalVideoObjectUrl}
                          className="max-h-48 w-full rounded-md border border-white/10 bg-black object-contain"
                          muted
                          playsInline
                          preload="metadata"
                          onLoadedMetadata={onModalVideoMeta}
                        />
                        {modalDuration > 0 ? (
                          <>
                            <label className="block text-xs text-zinc-500">
                              Момент: {modalSeekSec.toFixed(2)} с / {modalDuration.toFixed(1)} с
                              <input
                                type="range"
                                min={0}
                                max={modalDuration}
                                step={modalDuration > 120 ? 0.25 : 0.05}
                                value={modalSeekSec}
                                onChange={(e) => {
                                  const t = Number(e.target.value)
                                  setModalSeekSec(t)
                                  const v = modalVideoRef.current
                                  if (v) v.currentTime = t
                                }}
                                className="mt-1 block w-full accent-violet-500"
                              />
                            </label>
                            <Button type="button" variant="secondary" size="sm" onClick={useModalFrameFromSlider}>
                              Сделать постер из этого кадра
                            </Button>
                          </>
                        ) : null}
                        <div>
                          <p className="text-xs text-zinc-500">Или постер файлом</p>
                          <input
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm"
                            onChange={onModalExtraPosterPick}
                          />
                        </div>
                        {(modalFrameThumb || modalExtraThumb) ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={modalFrameThumb || modalExtraThumb || ''}
                              alt=""
                              className="h-16 rounded border border-white/10 object-cover"
                            />
                            <span className="text-xs text-zinc-400">Такой постер пойдёт в баннер вместе с видео</span>
                          </div>
                        ) : null}
                        <Button type="button" className="mt-2" onClick={applyVideoModalToBanner}>
                          Применить к баннеру (сохраните форму ниже)
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Каталог видео</p>
                  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {lib?.catalog.map((v) => (
                      <div
                        key={v.id}
                        className="flex gap-3 rounded-lg border border-white/10 bg-zinc-950 p-2"
                      >
                        <img
                          src={assetUrl(v.posterUrl)}
                          alt=""
                          className="size-20 shrink-0 rounded object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-zinc-200">{v.title}</p>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="mt-2"
                            onClick={() => {
                              setHeroVideoLibraryUrl(v.videoUrl)
                              setB((prev) => (prev ? { ...prev, previewImageUrl: v.posterUrl } : prev))
                              setPendingHeroVideo(null)
                              setPendingPreviewImage(null)
                              setClearVideo(false)
                              setPickerOpen(null)
                              resetVideoModalUpload()
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
                          setHeroVideoLibraryUrl(f.url)
                          setPendingHeroVideo(null)
                          setClearVideo(false)
                          setPickerOpen(null)
                          resetVideoModalUpload()
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
