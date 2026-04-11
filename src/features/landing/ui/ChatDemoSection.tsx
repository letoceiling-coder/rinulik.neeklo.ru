import type { PublicChatLine } from '@/shared/api/types'
import { ChatWidget } from '@/components/chat-widget/ChatWidget'

export interface ChatDemoSectionProps {
  lines: PublicChatLine[]
}

export function ChatDemoSection({ lines }: ChatDemoSectionProps) {
  const starterHints = lines.filter((l) => l.from === 'bot').map((l) => l.text)

  return (
    <section className="border-y border-white/10 bg-[#0a0e14] px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Онлайн-ассистент
          </h2>
          <p className="mt-2 text-zinc-400">
            Живой диалог с моделью на вашем сервере (Ollama). Темы-подсказки можно менять в панели
            «Чат: подсказки».
          </p>
        </div>
        <ChatWidget starterHints={starterHints} />
      </div>
    </section>
  )
}
