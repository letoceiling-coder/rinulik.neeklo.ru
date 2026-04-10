import type { ChatMessage, ChatThread } from '@/entities/chat'

export const MOCK_THREADS: ChatThread[] = [
  {
    id: 't1',
    title: 'Мария · маркетплейс',
    preview: 'Супер, жду превью ролика',
    time: '12:42',
    unread: 1,
  },
  {
    id: 't2',
    title: 'Заявка с сайта',
    preview: 'Можно ли озвучку мужским голосом?',
    time: 'Вчера',
    unread: 0,
  },
  {
    id: 't3',
    title: 'Instagram Direct',
    preview: 'Цена за 3 ролика?',
    time: 'Пн',
    unread: 2,
  },
]

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  t1: [
    {
      id: 'm1',
      threadId: 't1',
      from: 'user',
      text: 'Нужен ролик для карточки WB',
    },
    {
      id: 'm2',
      threadId: 't1',
      from: 'bot',
      text: 'Соберу структуру из 5 кадров. Какой товар?',
    },
    {
      id: 'm3',
      threadId: 't1',
      from: 'user',
      text: 'Блендер, акцент на мощность',
    },
    {
      id: 'm4',
      threadId: 't1',
      from: 'bot',
      text: 'Генерация превью… 67%',
    },
  ],
  t2: [
    {
      id: 'm5',
      threadId: 't2',
      from: 'user',
      text: 'Можно ли озвучку мужским голосом?',
    },
    {
      id: 'm6',
      threadId: 't2',
      from: 'bot',
      text: 'Да, в настройках голоса выберите «Мужской / нейтральный».',
    },
  ],
  t3: [
    {
      id: 'm7',
      threadId: 't3',
      from: 'user',
      text: 'Цена за 3 ролика?',
    },
    {
      id: 'm8',
      threadId: 't3',
      from: 'bot',
      text: 'Отправлю прайс на почту — оставьте email в форме ниже.',
    },
  ],
}
