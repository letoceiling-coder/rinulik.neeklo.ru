import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { DashboardCard } from '@/components/dashboard-card/DashboardCard'
import { useUiStore } from '@/app/store/useUiStore'
import { MOCK_LEADS } from '@/shared/mocks/leads'
import { MOCK_VIDEOS } from '@/shared/mocks/videos'
import { Button } from '@/shared/ui/button'

export function DashboardHomePage() {
  const [ready, setReady] = useState(false)
  const generationProgress = useUiStore((s) => s.generationProgress)
  const setGenerationProgress = useUiStore((s) => s.setGenerationProgress)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 550)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function simulateGeneration() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setGenerationProgress(0)
    let p = 0
    intervalRef.current = setInterval(() => {
      p += 9
      if (p >= 100) {
        setGenerationProgress(null)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      setGenerationProgress(p)
    }, 160)
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Главная</h1>
      <p className="mt-1 text-sm text-zinc-500">Сводка по воронке и контенту</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Лиды"
          value={MOCK_LEADS.length}
          hint="За последние 7 дней (mock)"
          loading={!ready}
        />
        <DashboardCard
          title="Видео"
          value={MOCK_VIDEOS.length}
          hint="Шаблоны в библиотеке"
          loading={!ready}
        />
        <DashboardCard
          title="Активные чаты"
          value={3}
          hint="Онлайн в виджете"
          loading={!ready}
        />
      </div>
      <motion.div
        layout
        className="mt-10 max-w-md rounded-xl border border-white/10 bg-zinc-900/50 p-5"
      >
        <h2 className="text-sm font-medium text-zinc-300">Имитация генерации</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Прогресс в Zustand — можно связать с очередью задач
        </p>
        <Button className="mt-4" type="button" onClick={simulateGeneration}>
          Запустить генерацию
        </Button>
        {generationProgress !== null ? (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                initial={false}
                animate={{ width: `${generationProgress}%` }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
              />
            </div>
            <p className="mt-2 text-xs text-violet-300">{generationProgress}%</p>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}
