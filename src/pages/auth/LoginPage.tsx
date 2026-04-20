import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/app/store/useAuthStore'
import { apiFetch } from '@/shared/api/client'
import type { AuthUser } from '@/shared/api/types'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function LoginPage() {
  const { user, setAuth } = useAuthStore()
  const location = useLocation()
  const fallback =
    (location.state as { from?: string } | null)?.from ?? null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    const to = fallback ?? (user.role === 'ADMIN' ? ROUTES.dashboard.root : ROUTES.studio)
    return <Navigate to={to} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        json: { email: email.trim().toLowerCase(), password },
      })
      setAuth(res.token, res.user)
      toast.success('Вход выполнен')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка входа'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
        <h1 className="text-center text-xl font-semibold text-white">Вход</h1>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Админы попадают в панель, пользователи — в Студию генерации
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs text-zinc-500" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500" htmlFor="password">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Вход…' : 'Войти'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Нет аккаунта?{' '}
          <Link to={ROUTES.register} className="text-violet-400 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-zinc-600">
          <Link to={ROUTES.home} className="text-zinc-500 hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </main>
  )
}
