import { Router } from 'express'
import { VideoCategory } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export const publicRouter = Router()

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
