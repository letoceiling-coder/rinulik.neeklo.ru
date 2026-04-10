import { useState } from 'react'
import type { AiAssistant } from '@/entities/assistant'
import { MOCK_ASSISTANTS } from '@/shared/mocks/assistants'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

const TONE_LABEL = {
  formal: 'Формальный',
  friendly: 'Дружелюбный',
  sales: 'Продажи',
} as const

export function DashboardAssistantsPage() {
  const [selected, setSelected] = useState<AiAssistant | null>(MOCK_ASSISTANTS[0] ?? null)

  if (!selected) {
    return (
      <div className="p-6">
        <p className="text-zinc-500">Нет ассистентов (mock)</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">AI ассистенты</h1>
      <p className="mt-1 text-sm text-zinc-500">Список и настройки (mock)</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <Card className="border-white/10 bg-zinc-900/40 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Список</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_ASSISTANTS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelected(a)}
                className={`flex w-full flex-col rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  a.id === selected.id
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'border-transparent hover:bg-white/5'
                }`}
              >
                <span className="font-medium text-zinc-100">{a.name}</span>
                <span className="text-xs text-zinc-500">{a.model}</span>
                <span
                  className={`mt-1 text-[10px] font-medium uppercase ${a.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}
                >
                  {a.isActive ? 'Активен' : 'Выкл'}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-zinc-900/40 lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base">{selected.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500" htmlFor="prompt">
                System prompt
              </label>
              <textarea
                id="prompt"
                className="mt-1 min-h-[120px] w-full rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100"
                defaultValue={selected.systemPrompt}
                readOnly
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-500" htmlFor="model">
                  Модель
                </label>
                <Input id="model" className="mt-1" defaultValue={selected.model} readOnly />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500" htmlFor="tone">
                  Стиль общения
                </label>
                <Input
                  id="tone"
                  className="mt-1"
                  defaultValue={TONE_LABEL[selected.tone]}
                  readOnly
                />
              </div>
            </div>
            <Button type="button" variant="secondary">
              Сохранить (mock)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
