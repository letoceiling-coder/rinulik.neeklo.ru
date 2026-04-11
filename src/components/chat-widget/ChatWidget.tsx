import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export interface ChatWidgetProps {
  /** Короткие темы из админки (строки «бота») — вставляются в поле ввода */
  starterHints?: string[]
}

type Msg = { role: 'user' | 'assistant'; content: string }

function apiBase() {
  return import.meta.env.VITE_API_URL ?? ''
}

async function postChat(messages: Msg[]): Promise<string> {
  const r = await fetch(`${apiBase()}/api/public/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  const text = await r.text()
  let data: { reply?: string; error?: string }
  try {
    data = JSON.parse(text) as { reply?: string; error?: string }
  } catch {
    throw new Error(text || 'Ошибка ответа сервера')
  }
  if (!r.ok) throw new Error(data.error || 'Ошибка чата')
  if (!data.reply) throw new Error('Пустой ответ')
  return data.reply
}

export function ChatWidget({ starterHints = [] }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Здравствуйте! Я онлайн-ассистент GenerateAI. Спросите про видео, тарифы или оставьте контакт в форме ниже.',
    },
  ])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busyRef.current) return
    busyRef.current = true
    setError(null)
    setDraft('')
    const userMsg: Msg = { role: 'user', content: trimmed }
    let forApi: Msg[] = []
    setMessages((prev) => {
      forApi = [...prev, userMsg]
      return forApi
    })
    setLoading(true)
    try {
      const reply = await postChat(forApi)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }, [])

  return (
    <Card className="mx-auto max-w-md overflow-hidden border-white/10">
      <CardHeader className="border-b border-white/10 bg-zinc-900/80 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <CardTitle className="text-base">GenerateAI Assistant</CardTitle>
            <p className="text-xs text-zinc-500">онлайн · ответы на базе AI</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 bg-[#0e1621] p-0">
        <div ref={scrollRef} className="flex max-h-[280px] flex-col gap-2 overflow-y-auto p-3">
          {messages.map((m, i) => (
            <motion.div
              key={`${i}-${m.content.slice(0, 12)}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md bg-[#2b5278] px-3 py-2 text-sm text-white'
                    : 'max-w-[85%] rounded-2xl rounded-bl-md bg-[#182533] px-3 py-2 text-sm text-zinc-100'
                }
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading ? (
            <p className="text-center text-xs text-zinc-500">Печатает…</p>
          ) : null}
        </div>
        {starterHints.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-3">
            {starterHints.slice(0, 4).map((h) => (
              <button
                key={h}
                type="button"
                className="rounded-full border border-white/10 bg-[#182533] px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10"
                onClick={() => setDraft(h.length > 120 ? `${h.slice(0, 117)}…` : h)}
              >
                {h.length > 36 ? `${h.slice(0, 33)}…` : h}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <p className="px-3 text-center text-xs text-red-400">{error}</p> : null}
        <div className="flex gap-2 border-t border-white/10 bg-zinc-950/50 p-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void sendText(draft)
              }
            }}
            placeholder="Сообщение…"
            className="border-white/10 bg-[#182533]"
            disabled={loading}
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="shrink-0"
            disabled={loading || !draft.trim()}
            onClick={() => void sendText(draft)}
          >
            ➤
          </Button>
        </div>
        <div className="px-3 pb-3">
          <Button className="w-full" variant="secondary" type="button" asChild>
            <a href="#cta">Оставить контакт</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
