import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import { apiFetch } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

interface AdminUserRow {
  id: string
  email: string
  role: string
  createdAt: string
}

export function DashboardUsersPage() {
  const selfId = useAuthStore((s) => s.user?.id)
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN')

  const load = useCallback(async () => {
    const r = await apiFetch<{ users: AdminUserRow[] }>('/api/admin/users')
    setUsers(r.users)
    setError(null)
  }, [])

  useEffect(() => {
    void load().catch((e) => {
      setError(e instanceof Error ? e.message : 'Ошибка')
      setUsers([])
    })
  }, [load])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        json: { email: email.trim(), password, role },
      })
      setEmail('')
      setPassword('')
      setRole('ADMIN')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  async function patchUser(id: string, body: { role?: string; password?: string }) {
    setError(null)
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'PATCH', json: body })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    }
  }

  async function removeUser(id: string) {
    if (!window.confirm('Удалить пользователя?')) return
    setError(null)
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Пользователи</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Вход в панель <code className="text-zinc-400">/dashboard</code> только для роли{' '}
        <span className="font-medium text-zinc-300">ADMIN</span>. Пользователи с ролью USER не видят
        админку.
      </p>
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <form
        onSubmit={(e) => void createUser(e)}
        className="mt-8 max-w-xl space-y-3 rounded-xl border border-white/10 bg-zinc-900/40 p-4"
      >
        <p className="text-sm font-medium text-zinc-300">Новый доступ</p>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="off"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль (мин. 6 символов)"
          required
          minLength={6}
          autoComplete="new-password"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
          className="h-10 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-100"
        >
          <option value="ADMIN">ADMIN — доступ в админ-панель</option>
          <option value="USER">USER — без панели (резерв)</option>
        </select>
        <Button type="submit" disabled={busy}>
          {busy ? 'Создание…' : 'Создать'}
        </Button>
      </form>

      <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Роль</th>
              <th className="px-4 py-3 font-medium">Создан</th>
              <th className="px-4 py-3 font-medium">Пароль</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-zinc-200">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => void patchUser(u.id, { role: e.target.value })}
                    className="rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {new Date(u.createdAt).toLocaleString('ru-RU')}
                </td>
                <td className="px-4 py-3">
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      const p = String(fd.get('pw') ?? '')
                      if (p.length >= 6) void patchUser(u.id, { password: p })
                      e.currentTarget.reset()
                    }}
                  >
                    <input
                      name="pw"
                      type="password"
                      placeholder="новый пароль"
                      minLength={6}
                      className="h-8 w-40 rounded border border-white/10 bg-zinc-950 px-2 text-xs text-zinc-100"
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      Сменить
                    </Button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={u.id === selfId}
                    onClick={() => void removeUser(u.id)}
                  >
                    Удалить
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
