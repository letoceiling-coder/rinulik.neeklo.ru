import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/app/store/useAuthStore'
import { apiFetch } from '@/shared/api/client'
import type { AuthUser } from '@/shared/api/types'
import { ROUTES } from '@/shared/config/routes'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function RegisterPage() {
  const { user, setAuth } = useAuthStore()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? ROUTES.dashboard.root : ROUTES.studio} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Пароль минимум 6 символов')
      return
    }
    if (password !== password2) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch<{ token: string; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        json: {
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        },
      })
      setAuth(res.token, res.user)
      toast.success('Регистрация завершена. Добро пожаловать в Студию!')
      navigate(ROUTES.studio, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка регистрации'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
        <h1 className="text-center text-xl font-semibold text-white">Регистрация</h1>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Создайте аккаунт, чтобы пользоваться Студией — 50 кредитов в сутки бесплатно
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-zinc-500" htmlFor="fn">Имя</label>
              <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-zinc-500" htmlFor="ln">Фамилия</label>
              <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500" htmlFor="email">Email</label>
            <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <label className="text-xs text-zinc-500" htmlFor="pw">Пароль</label>
            <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <label className="text-xs text-zinc-500" htmlFor="pw2">Повторите пароль</label>
            <Input id="pw2" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="mt-1" required />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Создание…' : 'Создать аккаунт'}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-zinc-500">
          Уже есть аккаунт?{' '}
          <Link to={ROUTES.login} className="text-violet-400 hover:underline">Войти</Link>
        </p>
        <p className="mt-2 text-center text-xs text-zinc-600">
          <Link to={ROUTES.home} className="text-zinc-500 hover:underline">На главную</Link>
        </p>
      </div>
    </main>
  )
}
