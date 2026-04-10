import { PricingCard } from '@/components/pricing-card/PricingCard'

const PLANS = [
  {
    name: 'Starter',
    price: '0 ₽',
    description: 'Попробовать пайплайн и чат-виджет',
    features: ['3 ролика в месяц', '1 ассистент', 'Базовые шаблоны'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '4 990 ₽',
    description: 'Для маркетинга и маркетплейсов',
    features: [
      '50 роликов',
      '5 ассистентов',
      'Приоритетная очередь',
      'Экспорт без вотермарка',
    ],
    highlighted: true,
  },
  {
    name: 'Business',
    price: 'от 29 990 ₽',
    description: 'Команда, CRM и кастомные модели',
    features: ['Безлимит роликов', 'SSO', 'SLA', 'Персональный менеджер'],
    highlighted: false,
  },
] as const

export function PricingSection() {
  return (
    <section className="border-t border-white/10 bg-zinc-900/20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Тарифы
        </h2>
        <p className="mt-2 text-zinc-400">Масштабируйтесь по мере роста воронки</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PricingCard
              key={p.name}
              name={p.name}
              price={p.price}
              description={p.description}
              features={[...p.features]}
              highlighted={p.highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
