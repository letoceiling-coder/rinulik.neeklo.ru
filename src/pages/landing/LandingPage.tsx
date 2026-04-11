import { useEffect, useState } from 'react'
import { Hero } from '@/components/hero/Hero'
import { AdvantagesSection } from '@/features/landing/ui/AdvantagesSection'
import { ChatDemoSection } from '@/features/landing/ui/ChatDemoSection'
import { CtaSection } from '@/features/landing/ui/CtaSection'
import { DemoVideosSection } from '@/features/landing/ui/DemoVideosSection'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { ProductsSection } from '@/features/landing/ui/ProductsSection'
import { ServicesSection } from '@/features/landing/ui/ServicesSection'
import { apiFetch } from '@/shared/api/client'
import type { PublicLandingPayload } from '@/shared/api/types'
import { Skeleton } from '@/shared/ui/skeleton'

export function LandingPage() {
  const [data, setData] = useState<PublicLandingPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch<PublicLandingPayload>('/api/public/landing')
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-red-400">{error}</p>
        <p className="mt-2 text-sm text-zinc-500">Проверьте, что API запущен (npm run dev)</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="space-y-8 px-4 py-12">
        <Skeleton className="mx-auto h-64 max-w-6xl rounded-xl" />
        <Skeleton className="mx-auto h-48 max-w-6xl rounded-xl" />
      </main>
    )
  }

  return (
    <>
      <Hero banner={data.banner} />
      <DemoVideosSection videos={data.videos} />
      <ServicesSection services={data.services} />
      <AdvantagesSection advantages={data.advantages} />
      <ProductsSection products={data.products} />
      <ChatDemoSection lines={data.chatDemo} />
      <PricingSection tariffs={data.tariffs} />
      <CtaSection banner={data.banner} />
    </>
  )
}
