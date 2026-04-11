import { useCallback, useEffect, useState } from 'react'
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
}

export function DashboardBannerPage() {
  const [b, setB] = useState<Banner | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const data = await apiFetch<Banner>('/api/admin/banner')
    setB(data)
  }, [])

  useEffect(() => {
    void load().catch(() => setB(null))
  }, [load])

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!b) return
    const form = e.currentTarget
    const fd = new FormData()
    fd.set('headline', b.headline)
    fd.set('subheadline', b.subheadline)
    fd.set('ctaPrimaryLabel', b.ctaPrimaryLabel)
    fd.set('ctaPrimaryHref', b.ctaPrimaryHref)
    fd.set('ctaSecondaryLabel', b.ctaSecondaryLabel)
    fd.set('ctaSecondaryHref', b.ctaSecondaryHref)
    fd.set('ctaBoxTitle', b.ctaBoxTitle)
    fd.set('ctaBoxSubtitle', b.ctaBoxSubtitle)
    const file = (form.elements.namedItem('previewImage') as HTMLInputElement | null)?.files?.[0]
    if (file) fd.append('previewImage', file)
    setBusy(true)
    try {
      const updated = await apiUploadForm<Banner>('/api/admin/banner', fd, 'PATCH')
      setB(updated)
      form.reset()
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
      <p className="mt-1 text-sm text-zinc-500">Запись id=1 · опционально новое превью</p>
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
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
            placeholder="CTA 1 ссылка"
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
        <label className="block text-xs text-zinc-500">
          Новое изображение превью (необязательно)
          <input type="file" name="previewImage" accept="image/*" className="mt-1 block w-full text-sm" />
        </label>
        {b.previewImageUrl ? (
          <img
            src={assetUrl(b.previewImageUrl)}
            alt=""
            className="max-h-40 rounded-lg border border-white/10 object-cover"
          />
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </form>
    </div>
  )
}
