import type { Video } from '@/entities/video'

const clip =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Скидка 24 часа — косметика',
    category: 'ad',
    posterSrc: 'https://picsum.photos/seed/v1/640/360',
    previewSrc: clip,
  },
  {
    id: '2',
    title: 'Обзор офиса за 30 секунд',
    category: 'business',
    posterSrc: 'https://picsum.photos/seed/v2/640/360',
    previewSrc: clip,
  },
  {
    id: '3',
    title: 'Тизер шоу — динамика и ритм',
    category: 'entertainment',
    posterSrc: 'https://picsum.photos/seed/v3/640/360',
    previewSrc: clip,
  },
  {
    id: '4',
    title: 'Поздравление с ДР — персонально',
    category: 'gifts',
    posterSrc: 'https://picsum.photos/seed/v4/640/360',
    previewSrc: clip,
  },
  {
    id: '5',
    title: 'Карточка товара — маркетплейс',
    category: 'products',
    posterSrc: 'https://picsum.photos/seed/v5/640/360',
    previewSrc: clip,
  },
  {
    id: '6',
    title: 'Запуск продукта — tech',
    category: 'business',
    posterSrc: 'https://picsum.photos/seed/v6/640/360',
    previewSrc: clip,
  },
]
