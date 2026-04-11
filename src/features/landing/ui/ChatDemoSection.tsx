import type { PublicChatLine } from '@/shared/api/types'
import { ChatWidget } from '@/components/chat-widget/ChatWidget'

export interface ChatDemoSectionProps {
  lines: PublicChatLine[]
}

export function ChatDemoSection({ lines }: ChatDemoSectionProps) {
  return (
    <section className="border-y border-white/10 bg-[#0a0e14] px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            AI Chat Demo
          </h2>
          <p className="mt-2 text-zinc-400">
            Интерфейс в духе Telegram: быстрые ответы, контекст диалога и кнопка
            действия для лида.
          </p>
        </div>
        <ChatWidget lines={lines} />
      </div>
    </section>
  )
}
