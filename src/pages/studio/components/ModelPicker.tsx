import { Sparkles, Gauge } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { StudioModel } from '@/shared/api/types'

interface Props {
  models: StudioModel[]
  value: string
  onChange: (id: string) => void
}

export function ModelPicker({ models, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {models.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            'rounded-xl border p-3 text-left transition-all',
            value === m.id
              ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-900/30'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">{m.label}</div>
              <div className="mt-0.5 text-xs leading-snug text-zinc-400">{m.tagline}</div>
            </div>
            <div className="flex flex-col items-end gap-1 text-[10px] text-zinc-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-900/40 px-2 py-0.5 text-violet-200">
                <Sparkles className="size-3" />
                {m.credits}
              </span>
              <span className="inline-flex items-center gap-1 text-zinc-500" title="Дневной лимит запросов (free-тариф Freepik на весь ключ)">
                <Gauge className="size-3" />
                {m.dailyFreeRPD}/сут
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
