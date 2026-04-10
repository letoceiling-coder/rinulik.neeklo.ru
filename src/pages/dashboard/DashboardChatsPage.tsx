import { useEffect, useRef } from 'react'
import { useChatLiveStore } from '@/app/store/useChatLiveStore'
import { TelegramDashboardChat } from '@/widgets/telegram-chat/ui/TelegramDashboardChat'

export function DashboardChatsPage() {
  const appendBotLine = useChatLiveStore((s) => s.appendBotLine)
  const activeThreadId = useChatLiveStore((s) => s.activeThreadId)
  const nRef = useRef(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      nRef.current += 1
      if (nRef.current > 3) return
      appendBotLine(
        activeThreadId,
        nRef.current === 1
          ? 'Системное: клиент прочитал сообщение'
          : 'Системное: очередь генерации +2',
      )
    }, 11000)
    return () => window.clearInterval(id)
  }, [activeThreadId, appendBotLine])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Чаты</h1>
      <p className="mt-1 text-sm text-zinc-500">
        UI как Telegram · mock realtime каждые ~11 с
      </p>
      <div className="mt-8">
        <TelegramDashboardChat />
      </div>
    </div>
  )
}
