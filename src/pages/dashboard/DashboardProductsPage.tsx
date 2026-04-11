import { useCallback, useEffect, useState } from 'react'
import { apiFetch, apiUploadForm } from '@/shared/api/client'
import { AdminMediaImage } from '@/shared/ui/AdminMediaImage'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface ProductRow {
  id: string
  title: string
  description: string
  imageUrl: string | null
  sortOrder: number
  published: boolean
}

export function DashboardProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await apiFetch<{ products: ProductRow[] }>('/api/admin/products')
    setRows(r.products)
  }, [])

  useEffect(() => {
    void load().catch(() => setRows([]))
  }, [load])

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData()
    fd.set('title', title.trim())
    fd.set('description', description.trim())
    fd.set('sortOrder', String(Number(sortOrder) || 0))
    fd.set('published', 'true')
    const img = (form.elements.namedItem('image') as HTMLInputElement | null)?.files?.[0]
    if (img) fd.append('image', img)
    setBusy(true)
    try {
      await apiUploadForm('/api/admin/products', fd, 'POST')
      form.reset()
      setTitle('')
      setDescription('')
      setSortOrder(0)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function save(row: ProductRow, imageFile: File | null) {
    const fd = new FormData()
    fd.set('title', row.title)
    fd.set('description', row.description)
    fd.set('sortOrder', String(row.sortOrder))
    fd.set('published', String(row.published))
    if (imageFile) fd.append('image', imageFile)
    await apiUploadForm(`/api/admin/products/${row.id}`, fd, 'PATCH')
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить продукт и файл изображения?')) return
    await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    await load()
  }

  function patchLocal(id: string, patch: Partial<ProductRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Продукты</h1>
      <p className="mt-1 text-sm text-zinc-500">Карточки блока на главной</p>
      <form
        onSubmit={add}
        className="mt-6 max-w-3xl space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок" required />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          required
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="max-w-[120px]"
        />
        <label className="block text-xs text-zinc-500">
          Изображение (необязательно)
          <input type="file" name="image" accept="image/*" className="mt-1 block w-full text-sm" />
        </label>
        <Button type="submit" disabled={busy}>
          Добавить
        </Button>
      </form>
      <ul className="mt-8 space-y-6">
        {rows.map((r) => (
          <ProductEditorRow key={r.id} row={r} onPatch={patchLocal} onSave={save} onRemove={remove} />
        ))}
      </ul>
    </div>
  )
}

function ProductEditorRow({
  row,
  onPatch,
  onSave,
  onRemove,
}: {
  row: ProductRow
  onPatch: (id: string, p: Partial<ProductRow>) => void
  onSave: (row: ProductRow, file: File | null) => Promise<void>
  onRemove: (id: string) => Promise<void>
}) {
  const [file, setFile] = useState<File | null>(null)
  const [largeOpen, setLargeOpen] = useState(false)
  return (
    <li className="rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm space-y-2">
      <div className="flex flex-wrap gap-2">
        <Input
          value={row.title}
          onChange={(e) => onPatch(row.id, { title: e.target.value })}
          className="max-w-xs"
        />
        <Input
          type="number"
          value={row.sortOrder}
          onChange={(e) => onPatch(row.id, { sortOrder: Number(e.target.value) || 0 })}
          className="w-24"
        />
        <label className="flex items-center gap-2 text-zinc-400">
          <input
            type="checkbox"
            checked={row.published}
            onChange={(e) => onPatch(row.id, { published: e.target.checked })}
          />
          опубликовано
        </label>
      </div>
      <textarea
        value={row.description}
        onChange={(e) => onPatch(row.id, { description: e.target.value })}
        rows={2}
        className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-zinc-100"
      />
      {row.imageUrl ? (
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            onClick={() => setLargeOpen(true)}
          >
            <AdminMediaImage url={row.imageUrl} alt="" className="max-h-32 max-w-full rounded-lg object-cover" />
          </button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setLargeOpen(true)}>
            Крупное превью
          </Button>
        </div>
      ) : null}
      {largeOpen && row.imageUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/75"
            aria-label="Закрыть"
            onClick={() => setLargeOpen(false)}
          />
          <div className="relative flex max-h-[min(92vh,900px)] w-full max-w-[min(1200px,96vw)] flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">{row.title}</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLargeOpen(false)}>
                Закрыть
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <AdminMediaImage
                url={row.imageUrl}
                alt=""
                className="max-h-[min(80vh,720px)] w-full rounded-lg border border-white/10 object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
      <label className="block text-xs text-zinc-500">
        Заменить картинку
        <input
          type="file"
          accept="image/*"
          className="mt-1 block w-full text-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => void onSave(row, file)}>
          Сохранить
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => void onRemove(row.id)}>
          Удалить
        </Button>
      </div>
    </li>
  )
}
