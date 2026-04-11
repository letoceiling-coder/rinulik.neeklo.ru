import { motion } from 'framer-motion'
import type { PublicAdvantage } from '@/shared/api/types'
import { getLucideIcon } from '@/shared/lib/lucide-icon'

export interface AdvantagesSectionProps {
  advantages: PublicAdvantage[]
}

export function AdvantagesSection({ advantages }: AdvantagesSectionProps) {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Преимущества
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item, i) => {
            const Icon = getLucideIcon(item.iconKey)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border border-white/10 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-5"
              >
                <Icon className="size-6 text-violet-400" aria-hidden />
                <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
