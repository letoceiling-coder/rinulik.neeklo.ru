import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
import { apiFetch } from '@/shared/api/client'
import type { AuthUser } from '@/shared/api/types'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function LoginPage() {
  const { user, setAuth } = useAuthStore()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard.root
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user?.role === 'ADMIN') {
    return <Navigate to={from} replace />
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/60 p-8">
        <h1 className="text-center text-xl font-semibold text-white">Вход администратора</h1>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Доступ к панели только для роли{' '}
          <span className="text-violet-400">ADMIN</span>
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
        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link to={ROUTES.home} className="text-violet-400 hover:underline">
            На главную
          </Link>
        </p>
      </div>
    </main>
  )
}
