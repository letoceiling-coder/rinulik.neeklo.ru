import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export function DashboardSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Настройки</h1>
      <p className="mt-1 text-sm text-zinc-500">Профиль и тариф</p>
      <div className="mt-8 grid max-w-2xl gap-6">
        <Card className="border-white/10 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-base">Профиль</CardTitle>
            <CardDescription>Данные аккаунта (mock)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                className="mt-1"
                defaultValue="founder@example.com"
                readOnly
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500" htmlFor="company">
                Компания
              </label>
              <Input id="company" className="mt-1" defaultValue="ООО «Пиксель»" readOnly />
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/30 to-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-base">Тариф</CardTitle>
            <CardDescription>Текущий план</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-white">Pro</p>
            <p className="mt-1 text-sm text-zinc-400">4 990 ₽ / мес · до 12.05.2026</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
