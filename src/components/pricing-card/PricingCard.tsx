import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  ctaLabel?: string
}

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
  ctaLabel = 'Выбрать',
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Card
        className={cn(
          'relative flex h-full flex-col overflow-hidden border-white/10 bg-zinc-900/40',
          highlighted &&
            'border-violet-500/40 bg-gradient-to-b from-violet-950/40 to-zinc-900/60 shadow-xl shadow-violet-950/25 ring-1 ring-violet-500/20',
        )}
      >
        {highlighted ? (
          <div className="absolute right-4 top-4 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-200">
            Популярно
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <p className="pt-2 text-3xl font-bold text-white">
            {price}
            <span className="text-base font-normal text-zinc-500"> / мес</span>
          </p>
        </CardHeader>
        <CardContent className="mt-auto flex flex-1 flex-col gap-4">
          <ul className="flex flex-col gap-2 text-sm text-zinc-300">
            {features.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-violet-400" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <Button variant={highlighted ? 'default' : 'secondary'} className="w-full">
            {ctaLabel}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
