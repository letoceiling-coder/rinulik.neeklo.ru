import { type FormEvent, useState } from 'react'
import type { PublicBanner } from '@/shared/api/types'
import { apiFetch } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export interface CtaSectionProps {
  banner: Pick<PublicBanner, 'ctaBoxTitle' | 'ctaBoxSubtitle'>
}

export function CtaSection({ banner }: CtaSectionProps) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '')
    const phone = String(fd.get('phone') ?? '')
    setLoading(true)
    try {
      await apiFetch('/api/public/leads', {
        method: 'POST',
        json: { name, phone, source: 'landing' },
      })
      setSent(true)
      // Не вызывать reset() после setSent: форма размонтируется и currentTarget может быть недоступен (React 19).
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="cta" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-zinc-950 p-8 text-center shadow-xl shadow-violet-950/20">
        <h2 className="text-2xl font-semibold text-white">{banner.ctaBoxTitle}</h2>
        <p className="mt-2 text-sm text-zinc-400">{banner.ctaBoxSubtitle}</p>
        {sent ? (
          <p className="mt-6 text-sm text-violet-300">Спасибо! Мы свяжемся в течение дня.</p>
        ) : (
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <Input name="name" placeholder="Имя" required className="flex-1" />
            <Input name="phone" placeholder="Телефон" required className="flex-1" />
            <Button type="submit" disabled={loading}>
              {loading ? '…' : 'Отправить'}
            </Button>
          </form>
        )}
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      </div>
    </section>
  )
}
