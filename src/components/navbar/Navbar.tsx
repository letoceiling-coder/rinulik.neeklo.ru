import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
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
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isAdmin = user?.role === 'ADMIN'
  const isUser = user?.role === 'USER'

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
          className="rounded-md text-sm font-semibold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
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
          {user ? (
            <NavLink to={ROUTES.studio} className={navLinkClass}>
              Студия
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to={ROUTES.dashboard.root} className={navLinkClass}>
              Дашборд
            </NavLink>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isUser ? (
                <Button variant="default" size="sm" className="hidden md:inline-flex" asChild>
                  <Link to={ROUTES.studio}>
                    <Sparkles className="size-3.5" /> Студия
                  </Link>
                </Button>
              ) : null}
              {isAdmin ? (
                <Button variant="secondary" size="sm" className="hidden md:inline-flex" asChild>
                  <Link to={ROUTES.dashboard.root}>Панель</Link>
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                type="button"
                onClick={() => logout()}
              >
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                <Link to={ROUTES.login}>Вход</Link>
              </Button>
              <Button variant="default" size="sm" className="hidden md:inline-flex" asChild>
                <Link to={ROUTES.register}>Регистрация</Link>
              </Button>
            </>
          )}
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
                {user ? (
                  <NavLink to={ROUTES.studio} className={mobileLinkClass}>
                    Студия
                  </NavLink>
                ) : null}
                {isAdmin ? (
                  <NavLink to={ROUTES.dashboard.root} className={mobileLinkClass}>
                    Дашборд
                  </NavLink>
                ) : null}
                {!user ? (
                  <>
                    <NavLink to={ROUTES.login} className={mobileLinkClass}>
                      Вход
                    </NavLink>
                    <NavLink to={ROUTES.register} className={mobileLinkClass}>
                      Регистрация
                    </NavLink>
                  </>
                ) : null}
              </nav>
              {user ? (
                <Button className="mt-4 w-full" variant="secondary" type="button" onClick={() => logout()}>
                  Выйти
                </Button>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  )
}
