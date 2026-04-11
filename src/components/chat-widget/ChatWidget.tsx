import { motion } from 'framer-motion'
import { useState } from 'react'
import type { PublicChatLine } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export interface ChatWidgetProps {
  lines: PublicChatLine[]
}

export function ChatWidget({ lines }: ChatWidgetProps) {
  const [draft, setDraft] = useState('')

  return (
    <Card className="mx-auto max-w-md overflow-hidden border-white/10">
      <CardHeader className="border-b border-white/10 bg-zinc-900/80 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <CardTitle className="text-base">GenerateAI Assistant</CardTitle>
            <p className="text-xs text-zinc-500">онлайн · демо</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 bg-[#0e1621] p-0">
        <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto p-3">
          {lines.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  m.from === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md bg-[#2b5278] px-3 py-2 text-sm text-white'
                    : 'max-w-[85%] rounded-2xl rounded-bl-md bg-[#182533] px-3 py-2 text-sm text-zinc-100'
                }
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-white/10 bg-zinc-950/50 p-3">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Сообщение..."
            className="border-white/10 bg-[#182533]"
            readOnly
          />
          <Button type="button" size="icon" variant="secondary" className="shrink-0">
            ➤
          </Button>
        </div>
        <div className="px-3 pb-3">
          <Button className="w-full" variant="secondary" type="button" asChild>
            <a href="#cta">Попробовать</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
