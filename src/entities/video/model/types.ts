/** Категории совпадают с ответом публичного API (lowercase). */
export type VideoCategory =
  | 'ad'
  | 'business'
  | 'entertainment'
  | 'gifts'
  | 'products'

export interface Video {
  id: string
  title: string
  category: VideoCategory
  posterSrc: string
  previewSrc: string
  durationSec?: number
}
