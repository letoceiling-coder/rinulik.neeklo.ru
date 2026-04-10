import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/config/routes'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors',
    isActive ? 'text-violet-300' : 'text-zinc-400 hover:text-zinc-100',
  )

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'block rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
    isActive ? 'bg-white/10 text-violet-200' : 'text-zinc-300 hover:bg-white/5',
  )

export function Navbar() {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to={ROUTES.home}
          className="text-sm font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded-md"
        >
          Generate<span className="text-violet-400">AI</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Основная навигация">
          <NavLink to={ROUTES.home} className={navLinkClass} end>
            Главная
          </NavLink>
          <NavLink to={ROUTES.videos} className={navLinkClass}>
            Видео
          </NavLink>
          <NavLink to={ROUTES.dashboard.root} className={navLinkClass}>
            Дашборд
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="hidden md:inline-flex" asChild>
            <Link to={ROUTES.dashboard.root}>Войти</Link>
          </Button>
          <Button size="sm" className="hidden sm:inline-flex md:hidden" asChild>
            <Link to={ROUTES.dashboard.root}>Кабинет</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        <AnimatePresence>
          {open ? (
            <motion.div
              id="mobile-nav"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full border-b border-white/10 bg-zinc-950/95 px-4 py-4 shadow-xl shadow-black/40 backdrop-blur-lg md:hidden"
            >
              <nav className="flex flex-col gap-1" aria-label="Мобильное меню">
                <NavLink to={ROUTES.home} className={mobileLinkClass} end>
                  Главная
                </NavLink>
                <NavLink to={ROUTES.videos} className={mobileLinkClass}>
                  Видео
                </NavLink>
                <NavLink to={ROUTES.dashboard.root} className={mobileLinkClass}>
                  Дашборд
                </NavLink>
              </nav>
              <Button className="mt-4 w-full" asChild>
                <Link to={ROUTES.dashboard.root}>Войти в кабинет</Link>
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
