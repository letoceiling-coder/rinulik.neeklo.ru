import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 80])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.35),transparent)]" />
      <div className="pointer-events-none absolute -right-32 top-1/4 size-[480px] rounded-full bg-indigo-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 size-96 rounded-full bg-violet-600/15 blur-[80px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Создаём видео, которые продают за вас
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base text-zinc-400 sm:text-lg">
            AI генерация рекламных роликов, контента и видео для бизнеса за
            минуты
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to={ROUTES.videos}>Создать видео</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <a href="#demo-videos">Смотреть демо</a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          style={{ y }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/80 via-zinc-900 to-indigo-950/90 shadow-2xl shadow-violet-950/40 ring-1 ring-white/5"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22g%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M60%200H0v60%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.04)%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3C%2Fsvg%3E')] opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all group-hover:bg-violet-500/30 group-hover:shadow-violet-500/40">
                <span className="ml-1 text-2xl">▶</span>
              </div>
            </div>
            <p className="absolute bottom-4 left-4 right-4 text-center text-xs text-zinc-500">
              Превью ролика (mock) · hover — glow
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
