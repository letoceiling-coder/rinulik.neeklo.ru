import type { Request, Response } from 'express'
import { Router } from 'express'
import { VideoCategory } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export const publicRouter = Router()

const chatRate = new Map<string, { count: number; windowStart: number }>()
const CHAT_WINDOW_MS = 60_000
const CHAT_MAX_PER_WINDOW = 24

function allowPublicChat(ip: string): boolean {
  const now = Date.now()
  let e = chatRate.get(ip)
  if (!e || now - e.windowStart > CHAT_WINDOW_MS) {
    e = { count: 0, windowStart: now }
  }
  e.count++
  chatRate.set(ip, e)
  return e.count <= CHAT_MAX_PER_WINDOW
}

function chatClientIp(req: Pick<Request, 'headers' | 'socket'>): string {
  const fwd = req.headers['x-forwarded-for']
  const fromFwd =
    typeof fwd === 'string'
      ? fwd.split(',')[0]?.trim()
      : Array.isArray(fwd)
        ? fwd[0]?.split(',')[0]?.trim()
        : undefined
  return fromFwd || req.socket.remoteAddress || '0'
}

type PublicChatMsg = { role: 'user' | 'assistant'; content: string }

function normalizePublicChatMessages(body: unknown): PublicChatMsg[] | null {
  const rawList = Array.isArray((body as { messages?: unknown }).messages)
    ? ((body as { messages: unknown[] }).messages)
    : []
  const normalized: PublicChatMsg[] = rawList
    .map((m) => {
      const o = m as { role?: string; content?: unknown }
      return {
        role: o.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: String(o.content ?? '').trim().slice(0, 8000),
      }
    })
    .filter((m) => m.content.length > 0)
  if (normalized.length === 0 || normalized.length > 40) return null
  return normalized
}

function ollamaChatMessages(normalized: PublicChatMsg[]) {
  const system = `Ты — вежливый ассистент сервиса GenerateAI (генерация рекламных и продуктовых видео, AI-инструменты).
Отвечай по-русски, кратко и по делу. Помогай пользователю понять услуги и подвести к оставлению контакта в форме на сайте (блок «Начать бесплатно» / #cta).
Не выдумывай цены и договоры; если спрашивают стоимость — предложи оставить телефон в форме.`
  return [{ role: 'system', content: system }, ...normalized] as { role: string; content: string }[]
}

function categoryToApi(c: VideoCategory): string {
  return c.toLowerCase()
}

publicRouter.get('/landing', async (_req, res) => {
  try {
    const banner = await prisma.heroBanner.findUnique({ where: { id: 1 } })
    if (!banner) {
      return res.status(503).json({ error: 'HeroBanner not configured' })
    }
    const [videos, services, advantages, tariffs, chatLines, products] =
      await Promise.all([
        prisma.video.findMany({
          where: { published: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        prisma.service.findMany({
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.advantage.findMany({
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.tariff.findMany({
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
        }),
        prisma.chatDemoLine.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.product.findMany({
          where: { published: true },
          orderBy: { sortOrder: 'asc' },
        }),
      ])

    res.json({
      banner: {
        headline: banner.headline,
        subheadline: banner.subheadline,
        ctaPrimaryLabel: banner.ctaPrimaryLabel,
        ctaPrimaryHref: banner.ctaPrimaryHref,
        ctaSecondaryLabel: banner.ctaSecondaryLabel,
        ctaSecondaryHref: banner.ctaSecondaryHref,
        previewImageUrl: banner.previewImageUrl,
        heroVideoUrl: banner.heroVideoUrl,
        ctaBoxTitle: banner.ctaBoxTitle,
        ctaBoxSubtitle: banner.ctaBoxSubtitle,
      },
      videos: videos.map((v) => ({
        id: v.id,
        title: v.title,
        category: categoryToApi(v.category),
        posterSrc: v.posterUrl,
        previewSrc: v.videoUrl,
      })),
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        iconKey: s.iconKey,
      })),
      advantages: advantages.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        iconKey: a.iconKey,
      })),
      tariffs: tariffs.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        description: t.description,
        features: JSON.parse(t.features) as string[],
        highlighted: t.highlighted,
      })),
      chatDemo: chatLines.map((c) => ({
        id: c.id,
        from: c.side === 'USER' ? 'user' : 'bot',
        text: c.text,
      })),
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
      })),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

publicRouter.get('/videos', async (req, res) => {
  const q = (req.query.q as string | undefined)?.trim().toLowerCase()
  const cat = req.query.category as string | undefined
  try {
    const where: { published: boolean; category?: VideoCategory; OR?: object[] } =
      { published: true }
    if (cat && cat !== 'all') {
      const upper = cat.toUpperCase() as keyof typeof VideoCategory
      if (VideoCategory[upper]) {
        where.category = VideoCategory[upper]
      }
    }
    let list = await prisma.video.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    if (q) {
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          categoryToApi(v.category).includes(q),
      )
    }
    res.json({
      videos: list.map((v) => ({
        id: v.id,
        title: v.title,
        category: categoryToApi(v.category),
        posterSrc: v.posterUrl,
        previewSrc: v.videoUrl,
      })),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

function writeSse(res: Response, obj: object) {
  res.write(`data: ${JSON.stringify(obj)}\n\n`)
}

publicRouter.post('/chat/stream', async (req, res) => {
  const ip = chatClientIp(req)
  if (!allowPublicChat(ip)) {
    return res.status(429).json({ error: 'Слишком много сообщений. Подождите минуту.' })
  }
  const ollamaBase = (process.env.OLLAMA_URL || '').replace(/\/$/, '')
  if (!ollamaBase) {
    return res.status(503).json({
      error:
        'Ассистент временно недоступен. На сервере задайте OLLAMA_URL (например http://188.124.55.89:11434).',
    })
  }
  const normalized = normalizePublicChatMessages(req.body)
  if (!normalized) {
    return res.status(400).json({ error: 'invalid messages' })
  }
  const model = process.env.OLLAMA_MODEL || 'llama3:8b'
  const messages = ollamaChatMessages(normalized)

  res.status(200)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const upstreamAbort = new AbortController()
  const onClose = () => upstreamAbort.abort()
  req.on('close', onClose)
  req.on('aborted', onClose)

  try {
    const r = await fetch(`${ollamaBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
      signal: upstreamAbort.signal,
    })

    if (!r.ok) {
      let errBody = ''
      try {
        errBody = await r.text()
      } catch {
        /* ignore */
      }
      writeSse(res, { type: 'error', error: errBody || r.statusText || 'Ollama error' })
      res.end()
      return
    }

    if (!r.body) {
      writeSse(res, { type: 'error', error: 'empty upstream body' })
      res.end()
      return
    }

    const reader = r.body.getReader()
    const decoder = new TextDecoder()
    let carry = ''
    /** Ollama может слать либо дельты, либо накопленный content — отдаём клиенту только прирост */
    let contentSoFar = ''
    const emitContent = (raw: string) => {
      if (!raw) return
      if (raw.length >= contentSoFar.length && raw.startsWith(contentSoFar)) {
        const delta = raw.slice(contentSoFar.length)
        contentSoFar = raw
        if (delta) writeSse(res, { type: 'token', t: delta })
      } else {
        contentSoFar += raw
        writeSse(res, { type: 'token', t: raw })
      }
    }
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      carry += decoder.decode(value, { stream: true })
      const lines = carry.split('\n')
      carry = lines.pop() ?? ''
      for (const line of lines) {
        const s = line.trim()
        if (!s) continue
        let chunk: { message?: { content?: string }; done?: boolean; error?: string }
        try {
          chunk = JSON.parse(s) as typeof chunk
        } catch {
          continue
        }
        if (chunk.error) {
          writeSse(res, { type: 'error', error: chunk.error })
          res.end()
          return
        }
        const piece = chunk.message?.content
        if (piece) emitContent(piece)
        if (chunk.done) writeSse(res, { type: 'done' })
      }
    }
    if (carry.trim()) {
      try {
        const chunk = JSON.parse(carry.trim()) as {
          message?: { content?: string }
          done?: boolean
          error?: string
        }
        if (chunk.error) {
          writeSse(res, { type: 'error', error: chunk.error })
        } else {
          if (chunk.message?.content) emitContent(chunk.message.content)
          if (chunk.done) writeSse(res, { type: 'done' })
        }
      } catch {
        /* ignore trailing garbage */
      }
    }
    res.end()
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') {
      res.end()
      return
    }
    console.error('public chat stream', e)
    try {
      writeSse(res, { type: 'error', error: 'Не удалось связаться с AI.' })
    } catch {
      /* headers sent */
    }
    res.end()
  } finally {
    req.removeListener('close', onClose)
    req.removeListener('aborted', onClose)
  }
})

publicRouter.post('/chat', async (req, res) => {
  const ip = chatClientIp(req)
  if (!allowPublicChat(ip)) {
    return res.status(429).json({ error: 'Слишком много сообщений. Подождите минуту.' })
  }
  const ollamaBase = (process.env.OLLAMA_URL || '').replace(/\/$/, '')
  if (!ollamaBase) {
    return res.status(503).json({
      error:
        'Ассистент временно недоступен. На сервере задайте OLLAMA_URL (например http://188.124.55.89:11434).',
    })
  }
  const normalized = normalizePublicChatMessages(req.body)
  if (!normalized) {
    return res.status(400).json({ error: 'invalid messages' })
  }
  const model = process.env.OLLAMA_MODEL || 'llama3:8b'
  const ollamaMessages = ollamaChatMessages(normalized)

  try {
    const r = await fetch(`${ollamaBase}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: ollamaMessages, stream: false }),
      signal: AbortSignal.timeout(120_000),
    })
    const json = (await r.json()) as { message?: { content?: string }; error?: string }
    if (!r.ok) {
      return res.status(502).json({ error: json.error || 'Ошибка Ollama' })
    }
    const reply = json.message?.content?.trim()
    if (!reply) return res.status(502).json({ error: 'Пустой ответ модели' })
    res.json({ reply })
  } catch (e) {
    console.error('public chat', e)
    res.status(502).json({ error: 'Не удалось связаться с AI. Проверьте OLLAMA_URL и доступ с сервера.' })
  }
})

publicRouter.post('/leads', async (req, res) => {
  const { name, phone, source } = req.body as {
    name?: string
    phone?: string
    source?: string
  }
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'name and phone required' })
  }
  try {
    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        source: source?.trim() || 'landing',
      },
    })
    res.status(201).json({ id: lead.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})
