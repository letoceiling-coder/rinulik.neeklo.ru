import { motion } from 'framer-motion'
import { Bot, Gift, Megaphone, ShoppingBag, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

const ITEMS = [
  {
    title: 'Генерация рекламных видео',
    icon: Megaphone,
    text: 'Креативы под таргет, короткие офферы и A/B варианты.',
  },
  {
    title: 'Видео для маркетплейсов',
    icon: ShoppingBag,
    text: 'Карточки товара, упаковка преимуществ, динамичный монтаж.',
  },
  {
    title: 'Видео подарки',
    icon: Gift,
    text: 'Персональные поздравления и сюжеты «под ключ».',
  },
  {
    title: 'Видео для бизнеса',
    icon: Video,
    text: 'О компании, онбординг, внутренние коммуникации.',
  },
  {
    title: 'AI ассистенты',
    icon: Bot,
    text: 'Чат на сайте + сбор лидов и квалификация в CRM.',
  },
] as const

export function ServicesSection() {
  return (
    <section className="border-y border-white/10 bg-zinc-900/30 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Услуги
        </h2>
        <p className="mt-2 text-zinc-400">Один продукт — от идеи до диалога с клиентом</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full border-white/10 bg-zinc-950/50 transition-colors hover:border-violet-500/20">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <item.icon className="size-5 text-violet-400" aria-hidden />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">{item.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
