import type { PublicTariff } from '@/shared/api/types'
import { PricingCard } from '@/components/pricing-card/PricingCard'

export interface PricingSectionProps {
  tariffs: PublicTariff[]
}

export function PricingSection({ tariffs }: PricingSectionProps) {
  return (
    <section className="border-t border-white/10 bg-zinc-900/20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Тарифы
        </h2>
        <p className="mt-2 text-zinc-400">Масштабируйтесь по мере роста воронки</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {tariffs.map((p) => (
            <PricingCard
              key={p.id}
              name={p.name}
              price={p.price}
              description={p.description}
              features={p.features}
              highlighted={p.highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
