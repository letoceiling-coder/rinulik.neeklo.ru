import { create } from 'zustand'
import type { ChatMessage, ChatThread } from '@/entities/chat'
import { MOCK_MESSAGES, MOCK_THREADS } from '@/shared/mocks/chat-threads'

function cloneMessages(): Record<string, ChatMessage[]> {
  const out: Record<string, ChatMessage[]> = {}
  for (const k of Object.keys(MOCK_MESSAGES)) {
    out[k] = MOCK_MESSAGES[k].map((m) => ({ ...m }))
  }
  return out
}

interface ChatLiveState {
  threads: ChatThread[]
  activeThreadId: string
  messagesByThread: Record<string, ChatMessage[]>
  setActiveThread: (id: string) => void
  appendBotLine: (threadId: string, text: string) => void
}

export const useChatLiveStore = create<ChatLiveState>((set, get) => ({
  threads: MOCK_THREADS.map((t) => ({ ...t })),
  activeThreadId: MOCK_THREADS[0]?.id ?? 't1',
  messagesByThread: cloneMessages(),
  setActiveThread: (activeThreadId) => set({ activeThreadId }),
  appendBotLine: (threadId, text) => {
    const prev = get().messagesByThread[threadId] ?? []
    const id = `live-${Date.now()}`
    set({
      messagesByThread: {
        ...get().messagesByThread,
        [threadId]: [
          ...prev,
          { id, threadId, from: 'bot', text },
        ],
      },
    })
  },
}))
