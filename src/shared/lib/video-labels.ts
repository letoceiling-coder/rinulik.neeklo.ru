import type { VideoCategory } from '@/entities/video'

const LABELS: Record<VideoCategory, string> = {
  ad: 'Реклама',
  business: 'Бизнес',
  entertainment: 'Развлечения',
  gifts: 'Подарки',
  products: 'Товары',
}

export function videoCategoryLabel(category: VideoCategory): string {
  return LABELS[category]
}
