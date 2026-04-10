import { Hero } from '@/components/hero/Hero'
import { AdvantagesSection } from '@/features/landing/ui/AdvantagesSection'
import { ChatDemoSection } from '@/features/landing/ui/ChatDemoSection'
import { CtaSection } from '@/features/landing/ui/CtaSection'
import { DemoVideosSection } from '@/features/landing/ui/DemoVideosSection'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { ServicesSection } from '@/features/landing/ui/ServicesSection'

export function LandingPage() {
  return (
    <>
      <Hero />
      <DemoVideosSection />
      <ServicesSection />
      <AdvantagesSection />
      <ChatDemoSection />
      <PricingSection />
      <CtaSection />
    </>
  )
}
