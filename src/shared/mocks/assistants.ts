import type { AiAssistant } from '@/entities/assistant'

export const MOCK_ASSISTANTS: AiAssistant[] = [
  {
    id: 'a1',
    name: 'Продажи B2B',
    model: 'gpt-4.1',
    systemPrompt:
      'Ты консультант по видеорекламе. Собирай УТП и бюджет, предлагай пакеты.',
    tone: 'formal',
    isActive: true,
  },
  {
    id: 'a2',
    name: 'Поддержка магазина',
    model: 'gpt-4.1-mini',
    systemPrompt: 'Короткие ответы, эмодзи умеренно, эскалация на оператора.',
    tone: 'friendly',
    isActive: true,
  },
  {
    id: 'a3',
    name: 'Лидогенерация',
    model: 'claude-3.5',
    systemPrompt: 'Цель — записать телефон и интерес. Закрывай на следующий шаг.',
    tone: 'sales',
    isActive: false,
  },
]
