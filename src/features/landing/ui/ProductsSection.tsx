import { motion } from 'framer-motion'
import type { PublicProduct } from '@/shared/api/types'
import { assetUrl } from '@/shared/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export interface ProductsSectionProps {
  products: PublicProduct[]
}

export function ProductsSection({ products }: ProductsSectionProps) {
  if (products.length === 0) return null
  return (
    <section className="border-y border-white/10 bg-zinc-950/40 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Продукты
        </h2>
        <p className="mt-2 text-zinc-400">Решения под ваши задачи</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-white/10 bg-zinc-900/50">
                {p.imageUrl ? (
                  <img
                    src={assetUrl(p.imageUrl)}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                ) : null}
                <CardHeader>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">{p.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
