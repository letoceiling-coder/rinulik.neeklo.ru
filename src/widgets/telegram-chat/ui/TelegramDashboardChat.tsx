import { motion } from 'framer-motion'
import { useChatLiveStore } from '@/app/store/useChatLiveStore'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function TelegramDashboardChat() {
  const threads = useChatLiveStore((s) => s.threads)
  const activeThreadId = useChatLiveStore((s) => s.activeThreadId)
  const setActiveThread = useChatLiveStore((s) => s.setActiveThread)
  const messagesByThread = useChatLiveStore((s) => s.messagesByThread)

  const messages = messagesByThread[activeThreadId] ?? []
  const active = threads.find((t) => t.id === activeThreadId)

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0e1621] md:flex-row md:min-h-[480px]">
      <aside className="w-full shrink-0 border-b border-white/10 md:w-72 md:border-b-0 md:border-r">
        <div className="flex h-12 items-center border-b border-white/10 px-3 text-sm font-semibold text-white">
          Диалоги
        </div>
        <div className="max-h-48 overflow-y-auto md:max-h-none">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveThread(t.id)}
              className={`flex w-full flex-col items-start gap-0.5 border-b border-white/5 px-3 py-2.5 text-left text-sm transition-colors ${
                t.id === activeThreadId ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="font-medium text-zinc-100">{t.title}</span>
              <span className="line-clamp-1 text-xs text-zinc-500">{t.preview}</span>
              <span className="text-[10px] text-zinc-600">{t.time}</span>
            </button>
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center border-b border-white/10 px-4">
          <span className="text-sm font-medium text-white">
            {active?.title ?? 'Чат'}
          </span>
          {active && active.unread > 0 ? (
            <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">
              {active.unread} new
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
          {messages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  m.from === 'user'
                    ? 'max-w-[88%] rounded-2xl rounded-br-md bg-[#2b5278] px-3 py-2 text-sm text-white'
                    : 'max-w-[88%] rounded-2xl rounded-bl-md bg-[#182533] px-3 py-2 text-sm text-zinc-100'
                }
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-white/10 p-3">
          <Input
            readOnly
            placeholder="Realtime mock — поле только для вида"
            className="border-white/10 bg-[#182533]"
          />
          <Button type="button" size="icon" variant="secondary">
            ➤
          </Button>
        </div>
      </div>
    </div>
  )
}
