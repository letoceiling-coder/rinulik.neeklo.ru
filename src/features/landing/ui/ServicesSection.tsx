import { motion } from 'framer-motion'
import type { PublicService } from '@/shared/api/types'
import { getLucideIcon } from '@/shared/lib/lucide-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export interface ServicesSectionProps {
  services: PublicService[]
}

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section className="border-y border-white/10 bg-zinc-900/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Услуги
        </h2>
        <p className="mt-2 text-zinc-400">Один продукт — от идеи до диалога с клиентом</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, i) => {
            const Icon = getLucideIcon(item.iconKey)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full border-white/10 bg-zinc-950/50 transition-colors hover:border-violet-500/20">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Icon className="size-5 text-violet-400" aria-hidden />
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
