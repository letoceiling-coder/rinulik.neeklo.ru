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

async function streamPublicChat(
  messages: Msg[],
  signal: AbortSignal,
  onDelta: (piece: string) => void,
): Promise<void> {
  const r = await fetch(`${apiBase()}/api/public/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal,
  })
  if (!r.ok) {
    const t = await r.text()
    let msg = t
    try {
      const j = JSON.parse(t) as { error?: string }
      if (j.error) msg = j.error
    } catch {
      /* plain text */
    }
    throw new Error(msg || r.statusText)
  }
  const reader = r.body?.getReader()
  if (!reader) throw new Error('Нет тела ответа')
  const dec = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    for (;;) {
      const sep = buf.indexOf('\n\n')
      if (sep === -1) break
      const block = buf.slice(0, sep)
      buf = buf.slice(sep + 2)
      const dataLine = block.split('\n').find((l) => l.startsWith('data: '))
      if (!dataLine) continue
      let payload: { type: string; t?: string; error?: string }
      try {
        payload = JSON.parse(dataLine.slice(6)) as typeof payload
      } catch {
        continue
      }
      if (payload.type === 'error') throw new Error(payload.error || 'Ошибка')
      if (payload.type === 'token' && payload.t) onDelta(payload.t)
      if (payload.type === 'done') return
    }
  }
}

const INITIAL_MESSAGES: Msg[] = [
  {
    role: 'assistant',
    content:
      'Здравствуйте! Я онлайн-ассистент GenerateAI. Спросите про видео, тарифы или оставьте контакт в форме ниже.',
  },
]

function TypingDots() {
  return (
    <span className="inline-flex gap-1 px-0.5 align-middle">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-zinc-500"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </span>
  )
}

export function ChatWidget({ starterHints = [] }: ChatWidgetProps) {
  const messagesRef = useRef<Msg[]>(INITIAL_MESSAGES)
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MESSAGES)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)
  const streamAbortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamAbortRef.current?.abort()
    }
  }, [])

  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busyRef.current) return
    streamAbortRef.current?.abort()
    streamAbortRef.current = new AbortController()
    const signal = streamAbortRef.current.signal

    busyRef.current = true
    setError(null)
    setDraft('')
    const userMsg: Msg = { role: 'user', content: trimmed }
    const withUser = [...messagesRef.current, userMsg]
    messagesRef.current = withUser
    setMessages(withUser)
    setLoading(true)
    setPending(true)
    try {
      await streamPublicChat(withUser, signal, (delta) => {
        setLoading(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          let next: Msg[]
          if (last?.role === 'assistant') {
            next = [...prev.slice(0, -1), { role: 'assistant', content: last.content + delta }]
          } else {
            next = [...prev, { role: 'assistant', content: delta }]
          }
          messagesRef.current = next
          return next
        })
      })
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        if (!mountedRef.current) return
        const rolled = messagesRef.current.slice(0, -1)
        messagesRef.current = rolled
        setMessages(rolled)
        return
      }
      setError(e instanceof Error ? e.message : 'Ошибка')
      const rolled = messagesRef.current.slice(0, -1)
      messagesRef.current = rolled
      setMessages(rolled)
    } finally {
      setLoading(false)
      setPending(false)
      busyRef.current = false
    }
  }, [])

  const lastIndex = messages.length - 1
  const lastMsg = messages[lastIndex]
  const showTypingRow = loading || (pending && lastMsg?.role === 'user')

  return (
    <Card className="mx-auto max-w-md overflow-hidden border-white/10">
      <CardHeader className="border-b border-white/10 bg-zinc-900/80 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <CardTitle className="text-base">GenerateAI Assistant</CardTitle>
            <p className="text-xs text-zinc-500">онлайн · потоковый ответ</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 bg-[#0e1621] p-0">
        <div ref={scrollRef} className="flex max-h-[280px] flex-col gap-2 overflow-y-auto p-3">
          {messages.map((m, i) => (
            <motion.div
              key={`m-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.2) }}
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
                {m.role === 'assistant' && i === lastIndex && pending && m.content.length > 0 ? (
                  <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-violet-400 align-text-bottom" style={{ height: '1em' }} />
                ) : null}
              </div>
            </motion.div>
          ))}
          {showTypingRow ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-md bg-[#182533] px-3 py-2.5 text-sm text-zinc-400">
                <TypingDots />
                <span className="text-xs">Ассистент печатает…</span>
              </div>
            </motion.div>
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
            disabled={pending}
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="shrink-0"
            disabled={pending || !draft.trim()}
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
