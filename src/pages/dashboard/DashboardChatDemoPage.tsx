import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface Line {
  id: string
  text: string
  side: string
  sortOrder: number
}

export function DashboardChatDemoPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [text, setText] = useState('')
  const [side, setSide] = useState<'user' | 'bot'>('bot')
  const [sortOrder, setSortOrder] = useState(0)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await apiFetch<{ lines: Line[] }>('/api/admin/chat-demo')
    setLines(r.lines)
  }, [])

  useEffect(() => {
    void load().catch(() => setLines([]))
  }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await apiFetch('/api/admin/chat-demo', {
        method: 'POST',
        json: { text: text.trim(), side, sortOrder: Number(sortOrder) || 0 },
      })
      setText('')
      setSide('bot')
      setSortOrder(0)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function save(row: Line) {
    await apiFetch(`/api/admin/chat-demo/${row.id}`, {
      method: 'PATCH',
      json: {
        text: row.text,
        side: row.side.toLowerCase(),
        sortOrder: row.sortOrder,
      },
    })
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить реплику?')) return
    await apiFetch(`/api/admin/chat-demo/${id}`, { method: 'DELETE' })
    await load()
  }

  function patchLocal(id: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold text-white">Демо-чат</h1>
      <p className="mt-1 text-sm text-zinc-500">Реплики для блока на главной (сторона user / bot)</p>
      <form onSubmit={add} className="mt-6 flex max-w-3xl flex-wrap items-end gap-2 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст"
          required
          className="min-w-[200px] flex-1"
        />
        <select
          value={side}
          onChange={(e) => setSide(e.target.value as 'user' | 'bot')}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100"
        >
          <option value="user">user</option>
          <option value="bot">bot</option>
        </select>
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-24"
        />
        <Button type="submit" disabled={busy}>
          Добавить
        </Button>
      </form>
      <ul className="mt-8 space-y-3">
        {lines.map((l) => (
          <li
            key={l.id}
            className="flex flex-col gap-2 rounded-lg border border-white/10 bg-zinc-900/30 p-3 text-sm sm:flex-row sm:items-center"
          >
            <select
              value={l.side === 'BOT' || l.side.toLowerCase() === 'bot' ? 'bot' : 'user'}
              onChange={(e) => patchLocal(l.id, { side: e.target.value })}
              className="h-9 rounded border border-white/10 bg-zinc-950 px-2 text-zinc-100"
            >
              <option value="user">user</option>
              <option value="bot">bot</option>
            </select>
            <Input
              type="number"
              value={l.sortOrder}
              onChange={(e) => patchLocal(l.id, { sortOrder: Number(e.target.value) || 0 })}
              className="w-20"
            />
            <Input
              value={l.text}
              onChange={(e) => patchLocal(l.id, { text: e.target.value })}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={() => void save(l)}>
                OK
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => void remove(l.id)}>
                ×
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
