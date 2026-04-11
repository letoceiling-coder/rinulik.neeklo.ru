import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface AdvantageRow {
  id: string
  title: string
  description: string
  iconKey: string
  sortOrder: number
  published: boolean
}

export function DashboardAdvantagesPage() {
  const [rows, setRows] = useState<AdvantageRow[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [iconKey, setIconKey] = useState('Sparkles')
  const [sortOrder, setSortOrder] = useState(0)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await apiFetch<{ advantages: AdvantageRow[] }>('/api/admin/advantages')
    setRows(r.advantages)
  }, [])

  useEffect(() => {
    void load().catch(() => setRows([]))
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await apiFetch('/api/admin/advantages', {
        method: 'POST',
        json: {
          title: title.trim(),
          description: description.trim(),
          iconKey: iconKey.trim(),
          sortOrder: Number(sortOrder) || 0,
          published: true,
        },
      })
      setTitle('')
      setDescription('')
      setIconKey('Sparkles')
      setSortOrder(0)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function save(row: AdvantageRow) {
    await apiFetch(`/api/admin/advantages/${row.id}`, {
      method: 'PATCH',
      json: {
        title: row.title,
        description: row.description,
        iconKey: row.iconKey,
        sortOrder: row.sortOrder,
        published: row.published,
      },
    })
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить преимущество?')) return
    await apiFetch(`/api/admin/advantages/${id}`, { method: 'DELETE' })
    await load()
  }

  function patchLocal(id: string, patch: Partial<AdvantageRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Преимущества</h1>
      <p className="mt-1 text-sm text-zinc-500">Те же iconKey, что и у услуг (Lucide)</p>
      <form
        onSubmit={add}
        className="mt-6 grid max-w-3xl gap-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:grid-cols-2"
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Заголовок" required />
        <Input value={iconKey} onChange={(e) => setIconKey(e.target.value)} placeholder="iconKey" required />
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="sm:col-span-2 max-w-[120px]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
          required
          rows={3}
          className="sm:col-span-2 min-h-[80px] w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
        />
        <Button type="submit" disabled={busy} className="w-fit">
          Добавить
        </Button>
      </form>
      <ul className="mt-8 space-y-4">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-white/10 bg-zinc-900/30 p-4 text-sm space-y-2">
            <div className="flex flex-wrap gap-2">
              <Input
                value={r.title}
                onChange={(e) => patchLocal(r.id, { title: e.target.value })}
                className="max-w-xs"
              />
              <Input
                value={r.iconKey}
                onChange={(e) => patchLocal(r.id, { iconKey: e.target.value })}
                className="max-w-[140px]"
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
