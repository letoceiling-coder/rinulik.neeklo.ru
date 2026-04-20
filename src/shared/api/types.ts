export interface PublicBanner {
  headline: string
  subheadline: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
  previewImageUrl: string | null
  /** Фоновое видео в блоке превью героя (файл или внешний URL) */
  heroVideoUrl?: string | null
  ctaBoxTitle: string
  ctaBoxSubtitle: string
}

export interface PublicVideo {
  id: string
  title: string
  category: string
  posterSrc: string
  previewSrc: string
}

export interface PublicService {
  id: string
  title: string
  description: string
  iconKey: string
}

export interface PublicAdvantage {
  id: string
  title: string
  description: string
  iconKey: string
}

export interface PublicTariff {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  highlighted: boolean
}

export interface PublicChatLine {
  id: string
  from: 'user' | 'bot'
  text: string
}

export interface PublicProduct {
  id: string
  title: string
  description: string
  imageUrl: string | null
}

export interface PublicLandingPayload {
  banner: PublicBanner
  videos: PublicVideo[]
  services: PublicService[]
  advantages: PublicAdvantage[]
  tariffs: PublicTariff[]
  chatDemo: PublicChatLine[]
  products: PublicProduct[]
}

export interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
  firstName?: string | null
  lastName?: string | null
}

export type GenerationKind = 'IMAGE' | 'VIDEO'
export type GenerationStatus = 'QUEUED' | 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface StudioModelParam {
  name: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'image' | 'aspect'
  label: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  default?: string | number | boolean
  hint?: string
}

export interface StudioModel {
  id: string
  kind: GenerationKind
  label: string
  tagline: string
  credits: number
  dailyFreeRPD: number
  durationSec?: number
  params: StudioModelParam[]
  requiresReferenceImage?: boolean
}

export interface StudioCatalog {
  models: StudioModel[]
  aspectImage: { id: string; label: string }[]
  aspectVideo: { id: string; label: string }[]
}

export interface StudioUser {
  id: string
  email: string
  role: 'ADMIN' | 'USER'
  firstName?: string | null
  lastName?: string | null
  credits: number
  dailyCredits: number
  dailyUsed: number
  dailyResetAt: string
}

export interface StudioJob {
  id: string
  kind: GenerationKind
  modelId: string
  status: GenerationStatus
  prompt: string
  params: Record<string, unknown>
  resultUrls: string[]
  creditsCost: number
  freepikTaskId: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}
