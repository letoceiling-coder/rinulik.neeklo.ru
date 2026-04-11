import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface TariffRow {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  highlighted: boolean
  sortOrder: number
  published: boolean
}

function featuresToText(f: string[]) {
  return f.join('\n')
}

function textToFeatures(t: string) {
  return t
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function DashboardTariffsPage() {
  const [rows, setRows] = useState<TariffRow[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [highlighted, setHighlighted] = useState(false)
  const [sortOrder, setSortOrder] = useState(0)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await apiFetch<{ tariffs: TariffRow[] }>('/api/admin/tariffs')
    setRows(r.tariffs)
  }, [])

  useEffect(() => {
    void load().catch(() => setRows([]))
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const features = textToFeatures(featuresText)
    if (features.length === 0) {
      window.alert('Добавьте строки преимуществ (каждая с новой строки)')
      return
    }
    setBusy(true)
    try {
      await apiFetch('/api/admin/tariffs', {
        method: 'POST',
        json: {
          name: name.trim(),
          price: price.trim(),
          description: description.trim(),
          features,
          highlighted,
          sortOrder: Number(sortOrder) || 0,
          published: true,
        },
      })
      setName('')
      setPrice('')
      setDescription('')
      setFeaturesText('')
      setHighlighted(false)
      setSortOrder(0)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function save(row: TariffRow) {
    await apiFetch(`/api/admin/tariffs/${row.id}`, {
      method: 'PATCH',
      json: {
        name: row.name,
        price: row.price,
        description: row.description,
        features: row.features,
        highlighted: row.highlighted,
        sortOrder: row.sortOrder,
        published: row.published,
      },
    })
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить тариф?')) return
    await apiFetch(`/api/admin/tariffs/${id}`, { method: 'DELETE' })
    await load()
  }

  function patchLocal(id: string, patch: Partial<TariffRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Тарифы</h1>
      <p className="mt-1 text-sm text-zinc-500">Список фич — по одной строке в поле ниже</p>
      <form
        onSubmit={add}
        className="mt-6 max-w-3xl space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
      >
        <div className="flex flex-wrap gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" required />
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена" required />
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            placeholder="sort"
            className="w-28"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Краткое описание"
          required
          rows={2}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder={'Строки преимуществ\nкаждая с новой строки'}
          required
          rows={5}
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} />
          выделить на сайте
        </label>
        <Button type="submit" disabled={busy}>
          Добавить тариф
        </Button>
      </form>
      <ul className="mt-8 space-y-6">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm space-y-2">
            <div className="flex flex-wrap gap-2">
              <Input
                value={r.name}
                onChange={(e) => patchLocal(r.id, { name: e.target.value })}
                className="max-w-xs"
              />
              <Input
                value={r.price}
                onChange={(e) => patchLocal(r.id, { price: e.target.value })}
                className="max-w-[120px]"
              />
              <Input
                type="number"
                value={r.sortOrder}
                onChange={(e) => patchLocal(r.id, { sortOrder: Number(e.target.value) || 0 })}
                className="w-24"
              />
              <label className="flex items-center gap-2 text-zinc-400">
                <input
                  type="checkbox"
                  checked={r.highlighted}
                  onChange={(e) => patchLocal(r.id, { highlighted: e.target.checked })}
                />
                highlight
              </label>
              <label className="flex items-center gap-2 text-zinc-400">
                <input
                  type="checkbox"
                  checked={r.published}
                  onChange={(e) => patchLocal(r.id, { published: e.target.checked })}
                />
                опубликовано
              </label>
            </div>
            <textarea
              value={r.description}
              onChange={(e) => patchLocal(r.id, { description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <textarea
              value={featuresToText(r.features)}
              onChange={(e) => patchLocal(r.id, { features: textToFeatures(e.target.value) })}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => void save(r)}>
                Сохранить
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => void remove(r.id)}>
                Удалить
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
