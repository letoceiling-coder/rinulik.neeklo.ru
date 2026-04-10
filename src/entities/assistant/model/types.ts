import type { AssistantTone } from '@/shared/types'

export interface AiAssistant {
  id: string
  name: string
  model: string
  systemPrompt: string
  tone: AssistantTone
  isActive: boolean
}
