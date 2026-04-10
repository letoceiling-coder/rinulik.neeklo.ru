import { type FormEvent, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export function CtaSection() {
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-zinc-950 p-8 text-center shadow-xl shadow-violet-950/20">
        <h2 className="text-2xl font-semibold text-white">Начать бесплатно</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Оставьте контакт — пришлём доступ в песочницу
        </p>
        {sent ? (
          <p className="mt-6 text-sm text-violet-300">Спасибо! Мы свяжемся в течение дня.</p>
        ) : (
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <Input name="name" placeholder="Имя" required className="flex-1" />
            <Input name="phone" placeholder="Телефон" required className="flex-1" />
            <Button type="submit">Отправить</Button>
          </form>
        )}
      </div>
    </section>
  )
}
