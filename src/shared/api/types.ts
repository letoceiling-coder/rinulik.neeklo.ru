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
}
