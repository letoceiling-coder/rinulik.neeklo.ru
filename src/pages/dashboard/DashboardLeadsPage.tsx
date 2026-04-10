import { leadStatusLabel } from '@/shared/lib/lead-labels'
import { MOCK_LEADS } from '@/shared/mocks/leads'

export function DashboardLeadsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Лиды</h1>
      <p className="mt-1 text-sm text-zinc-500">Таблица CRM (mock)</p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Имя</th>
              <th className="px-4 py-3 font-medium">Телефон</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Источник</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_LEADS.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-zinc-200">{row.name}</td>
                <td className="px-4 py-3 text-zinc-400">{row.phone}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-200">
                    {leadStatusLabel(row.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
