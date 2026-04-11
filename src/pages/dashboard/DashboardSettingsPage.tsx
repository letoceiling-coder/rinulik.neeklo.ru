import { useAuthStore } from '@/app/store/useAuthStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'

export function DashboardSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Настройки</h1>
      <p className="mt-1 text-sm text-zinc-500">Текущий пользователь из сессии</p>
      <div className="mt-8 grid max-w-2xl gap-6">
        <Card className="border-white/10 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-base">Аккаунт</CardTitle>
            <CardDescription>Данные после входа (JWT + /api/auth/me)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500" htmlFor="email">
                Email
              </label>
              <Input id="email" className="mt-1" value={user?.email ?? ''} readOnly />
            </div>
            <div>
              <label className="text-xs text-zinc-500" htmlFor="role">
                Роль
              </label>
              <Input id="role" className="mt-1" value={user?.role ?? ''} readOnly />
            </div>
            <Button type="button" variant="secondary" onClick={() => logout()}>
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
