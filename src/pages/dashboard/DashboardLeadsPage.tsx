import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/shared/api/client'
import { leadStatusLabel } from '@/shared/lib/lead-labels'
import { Button } from '@/shared/ui/button'

interface LeadRow {
  id: string
  name: string
  phone: string
  source: string
  status: string
  createdAt: string
}

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as const

export function DashboardLeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const r = await apiFetch<{ leads: LeadRow[] }>('/api/admin/leads')
    setRows(r.leads)
    setError(null)
  }, [])

  useEffect(() => {
    void load().catch((e) => {
      setError(e instanceof Error ? e.message : 'Ошибка')
      setRows([])
    })
  }, [load])

  async function setStatus(id: string, status: string) {
    await apiFetch(`/api/admin/leads/${id}`, { method: 'PATCH', json: { status } })
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить заявку?')) return
    await apiFetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Заявки</h1>
      <p className="mt-1 text-sm text-zinc-500">С главной формы · статусы и удаление</p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Дата</th>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Источник</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(row.createdAt).toLocaleString('ru-RU')}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-200">{row.name}</td>
                <td className="px-4 py-3 text-zinc-400">{row.phone}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    onChange={(e) => void setStatus(row.id, e.target.value)}
                    className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {leadStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-400">{row.source}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => void remove(row.id)}>
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
