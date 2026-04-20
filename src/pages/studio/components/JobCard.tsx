import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, Clock, Download, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteJob, fetchStudioJob } from '@/shared/api/studio'
import type { StudioJob } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

const STATUS_META: Record<
  StudioJob['status'],
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  QUEUED: { label: 'В очереди', color: 'text-zinc-300 bg-zinc-800/80', icon: Clock },
  CREATED: { label: 'Создано', color: 'text-zinc-300 bg-zinc-800/80', icon: Clock },
  IN_PROGRESS: { label: 'В работе', color: 'text-amber-200 bg-amber-900/40', icon: Loader2 },
  COMPLETED: { label: 'Готово', color: 'text-emerald-200 bg-emerald-900/40', icon: CheckCircle2 },
  FAILED: { label: 'Ошибка', color: 'text-red-200 bg-red-900/50', icon: AlertTriangle },
}

export function JobCard({ job }: { job: StudioJob }) {
  const qc = useQueryClient()

  const isPending = job.status !== 'COMPLETED' && job.status !== 'FAILED'

  const { data } = useQuery({
    queryKey: ['studio-job', job.id],
    queryFn: () => fetchStudioJob(job.id),
    enabled: isPending,
    refetchInterval: isPending ? 3000 : false,
    initialData: { job },
  })

  const current = data?.job ?? job

  const del = useMutation({
    mutationFn: () => deleteJob(job.id),
    onSuccess: () => {
      toast.success('Удалено')
      qc.invalidateQueries({ queryKey: ['studio-jobs'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Ошибка'),
  })

  const meta = STATUS_META[current.status]
  const Icon = meta.icon

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 transition-all hover:border-white/20 hover:shadow-xl hover:shadow-black/30">
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
        {current.status === 'COMPLETED' && current.resultUrls.length > 0 ? (
          current.kind === 'VIDEO' ? (
            <video
              src={current.resultUrls[0]}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={current.resultUrls[0]}
              alt={current.prompt}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )
        ) : current.status === 'FAILED' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-red-300">
            <AlertTriangle className="size-6" />
            <span className="line-clamp-3">{current.errorMessage ?? 'Не удалось сгенерировать'}</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="size-6 animate-spin text-violet-400" />
            <span>{meta.label}…</span>
          </div>
        )}

        <span
          className={cn(
            'absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur',
            meta.color,
          )}
        >
          <Icon className={cn('size-3', current.status === 'IN_PROGRESS' && 'animate-spin')} />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-zinc-500">
          <span>{current.modelId}</span>
          <span>{current.creditsCost} кр.</span>
        </div>
        <p className="line-clamp-2 text-xs text-zinc-300">{current.prompt}</p>
        <div className="mt-1 flex items-center justify-end gap-1">
          {current.status === 'COMPLETED' && current.resultUrls[0] ? (
            <Button variant="ghost" size="icon" asChild>
              <a href={current.resultUrls[0]} download target="_blank" rel="noreferrer">
                <Download className="size-4" />
              </a>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => del.mutate()}
            disabled={del.isPending}
            aria-label="Удалить из истории"
          >
            <Trash2 className="size-4 text-red-300" />
          </Button>
        </div>
      </div>
    </div>
  )
}
