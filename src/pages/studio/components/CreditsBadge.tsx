import { Sparkles } from 'lucide-react'
import type { StudioUser } from '@/shared/api/types'

export function CreditsBadge({ user }: { user: StudioUser | undefined }) {
  if (!user) return null
  const remaining = Math.max(0, user.dailyCredits - user.dailyUsed)
  const pct = user.dailyCredits > 0 ? (user.dailyUsed / user.dailyCredits) * 100 : 0
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-zinc-300">
        <Sparkles className="size-3.5 text-violet-400" />
        <span className="font-medium">{remaining}</span>
        <span className="text-zinc-500">/ {user.dailyCredits} сегодня</span>
        {user.credits > 0 ? (
          <span className="ml-2 rounded-full bg-violet-900/40 px-2 py-0.5 text-[10px] text-violet-200">
            +{user.credits} бонус
          </span>
        ) : null}
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}
