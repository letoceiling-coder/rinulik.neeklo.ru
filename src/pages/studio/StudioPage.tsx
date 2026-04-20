import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Image as ImageIcon, Sparkles, Video as VideoIcon, History, Wand2, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/app/store/useAuthStore'
import { fetchStudioCatalog, fetchStudioJobs, fetchStudioMe, postGenerate } from '@/shared/api/studio'
import type { StudioJob, StudioModel } from '@/shared/api/types'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { CreditsBadge } from './components/CreditsBadge'
import { JobCard } from './components/JobCard'
import { ModelPicker } from './components/ModelPicker'
import { ParamForm } from './components/ParamForm'

type Tab = 'IMAGE' | 'VIDEO' | 'HISTORY'

function buildInitialParams(model: StudioModel): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const p of model.params) {
    if (p.default !== undefined) out[p.name] = p.default
  }
  return out
}

export function StudioPage() {
  const logout = useAuthStore((s) => s.logout)
  const authUser = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const [tab, setTab] = useState<Tab>('IMAGE')
  const [selectedModel, setSelectedModel] = useState<string>('flux-dev')
  const [params, setParams] = useState<Record<string, unknown>>({})

  const meQ = useQuery({ queryKey: ['studio-me'], queryFn: fetchStudioMe })
  const catalogQ = useQuery({ queryKey: ['studio-catalog'], queryFn: fetchStudioCatalog })
  const jobsQ = useQuery({
    queryKey: ['studio-jobs'],
    queryFn: fetchStudioJobs,
    refetchInterval: (q) => {
      const jobs = q.state.data?.jobs ?? []
      const hasActive = jobs.some(
        (j) => j.status === 'QUEUED' || j.status === 'CREATED' || j.status === 'IN_PROGRESS',
      )
      return hasActive ? 5000 : false
    },
  })

  const visibleModels = useMemo(
    () => (catalogQ.data?.models ?? []).filter((m) => (tab === 'HISTORY' ? true : m.kind === tab)),
    [catalogQ.data, tab],
  )

  const model = useMemo(
    () => catalogQ.data?.models.find((m) => m.id === selectedModel),
    [catalogQ.data, selectedModel],
  )

  // При смене таба — автоматический выбор первой модели соответствующего вида
  useEffect(() => {
    if (tab === 'HISTORY') return
    if (!catalogQ.data) return
    const current = catalogQ.data.models.find((m) => m.id === selectedModel)
    if (!current || current.kind !== tab) {
      const first = catalogQ.data.models.find((m) => m.kind === tab)
      if (first) {
        setSelectedModel(first.id)
        setParams(buildInitialParams(first))
      }
    }
  }, [tab, catalogQ.data, selectedModel])

  // При смене модели — сбрасываем params по дефолтам
  useEffect(() => {
    if (!model) return
    setParams(buildInitialParams(model))
  }, [model])

  const gen = useMutation({
    mutationFn: async () => {
      if (!model) throw new Error('Модель не выбрана')
      return postGenerate(model.id, params)
    },
    onSuccess: (res) => {
      toast.success(`Задача #${res.job.id.slice(0, 6)} создана`)
      qc.invalidateQueries({ queryKey: ['studio-jobs'] })
      qc.invalidateQueries({ queryKey: ['studio-me'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Ошибка генерации'),
  })

  const filteredJobs = useMemo(() => {
    const jobs = jobsQ.data?.jobs ?? []
    if (tab === 'HISTORY') return jobs
    return jobs.filter((j: StudioJob) => j.kind === tab)
  }, [jobsQ.data, tab])

  const activeCount = (jobsQ.data?.jobs ?? []).filter(
    (j) => j.status === 'QUEUED' || j.status === 'CREATED' || j.status === 'IN_PROGRESS',
  ).length

  const user = meQ.data?.user
  const canGenerate = useMemo(() => {
    if (!user || !model) return false
    const cost = model.credits
    return user.dailyUsed + cost <= user.dailyCredits || user.credits >= cost
  }, [user, model])

  // Валидация требуемых полей
  const missingRequired = useMemo(() => {
    if (!model) return null
    for (const p of model.params) {
      if (p.required) {
        const v = params[p.name]
        if (v === undefined || v === null || v === '') return p.label
      }
    }
    return null
  }, [model, params])

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to={ROUTES.home} className="flex items-center gap-2 text-sm font-semibold">
            <span>Generate<span className="text-violet-400">AI</span></span>
            <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-200">Studio</span>
          </Link>
          <div className="flex items-center gap-3">
            <CreditsBadge user={user} />
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-xs text-zinc-400">
                {authUser?.firstName || authUser?.email}
              </span>
              {authUser?.role === 'ADMIN' ? (
                <Link to={ROUTES.dashboard.root} className="text-[11px] text-violet-400 hover:underline">
                  Админ-панель
                </Link>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              Выйти
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto border-t border-white/5 px-2 sm:px-4">
          {[
            { id: 'IMAGE' as const, label: 'Изображения', icon: ImageIcon },
            { id: 'VIDEO' as const, label: 'Видео', icon: VideoIcon },
            { id: 'HISTORY' as const, label: 'История', icon: History },
          ].map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative inline-flex items-center gap-2 rounded-t-lg px-4 py-2 text-sm transition-all',
                  tab === t.id
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-200',
                )}
              >
                <Icon className="size-4" />
                {t.label}
                {t.id === 'HISTORY' && activeCount > 0 ? (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500/80 px-1.5 text-[10px] text-white">
                    {activeCount}
                  </span>
                ) : null}
                {tab === t.id ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                ) : null}
              </button>
            )
          })}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[420px_1fr]">
        {/* Left column — параметры */}
        {tab !== 'HISTORY' ? (
          <section className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                <Wand2 className="size-3.5" />
                Модель
              </div>
              {catalogQ.data ? (
                <ModelPicker
                  models={visibleModels}
                  value={selectedModel}
                  onChange={setSelectedModel}
                />
              ) : (
                <p className="text-sm text-zinc-500">Загрузка…</p>
              )}
            </div>

            {model && catalogQ.data ? (
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Параметры
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-200">
                    <Sparkles className="size-3" />
                    {model.credits} кр.
                  </span>
                </div>
                <ParamForm
                  model={model}
                  catalog={catalogQ.data}
                  params={params}
                  onChange={setParams}
                />
                <div className="mt-4 flex flex-col gap-2">
                  {missingRequired ? (
                    <p className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                      <Info className="size-3" /> Заполните поле «{missingRequired}»
                    </p>
                  ) : !canGenerate ? (
                    <p className="inline-flex items-center gap-1 text-[11px] text-red-300">
                      <Info className="size-3" /> Недостаточно кредитов
                    </p>
                  ) : null}
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={gen.isPending || !canGenerate || !!missingRequired}
                    onClick={() => gen.mutate()}
                  >
                    {gen.isPending ? 'Создание…' : `Сгенерировать (${model.credits} кр.)`}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 text-[11px] leading-relaxed text-zinc-500">
              <p>
                Freepik работает по модели pay-per-use. Бесплатного безлимита нет —
                у всего проекта общий дневной предел на каждый API (RPD).
                Мы выделяем каждому пользователю квоту из внутренних кредитов
                (сбрасывается каждые 24&nbsp;ч), чтобы нагрузка была честной.
              </p>
            </div>
          </section>
        ) : null}

        {/* Right column — результаты */}
        <section
          className={cn(
            'space-y-4',
            tab === 'HISTORY' ? 'lg:col-span-2' : '',
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">
              {tab === 'HISTORY' ? 'История' : tab === 'IMAGE' ? 'Ваши изображения' : 'Ваши видео'}
            </h2>
            <span className="text-xs text-zinc-500">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'задача' : 'задач'}
            </span>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
              <Sparkles className="mb-3 size-10 text-violet-500/60" />
              <p className="text-sm text-zinc-400">
                {tab === 'HISTORY'
                  ? 'Вы ещё ничего не генерировали'
                  : 'Опишите сцену слева — и нажмите «Сгенерировать»'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
