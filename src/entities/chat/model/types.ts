export interface ChatThread {
  id: string
  title: string
  preview: string
  time: string
  unread: number
}

export interface ChatMessage {
  id: string
  threadId: string
  from: 'user' | 'bot'
  text: string
}
