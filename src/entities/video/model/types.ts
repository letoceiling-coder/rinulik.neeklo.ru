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
  /** Poster or thumbnail */
  posterSrc: string
  /** Short preview clip (e.g. mp4) */
  previewSrc: string
  durationSec?: number
}
