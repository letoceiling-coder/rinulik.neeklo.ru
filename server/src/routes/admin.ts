import path from 'node:path'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { Prisma, VideoCategory, LeadStatus, ChatSide, Role } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAdmin, type AuthedRequest } from '../middleware/requireAdmin.js'

const uploadRoot = path.resolve(process.cwd(), 'uploads')

function ensureUploadDirs() {
  for (const d of ['posters', 'videos', 'products', 'banner']) {
    fs.mkdirSync(path.join(uploadRoot, d), { recursive: true })
  }
}

ensureUploadDirs()

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'poster') cb(null, path.join(uploadRoot, 'posters'))
    else if (file.fieldname === 'video') cb(null, path.join(uploadRoot, 'videos'))
    else if (file.fieldname === 'image') cb(null, path.join(uploadRoot, 'products'))
    else if (file.fieldname === 'previewImage') cb(null, path.join(uploadRoot, 'banner'))
    else if (file.fieldname === 'heroVideo') cb(null, path.join(uploadRoot, 'banner'))
    else cb(null, uploadRoot)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
})

export const adminRouter = Router()
adminRouter.use(requireAdmin)

function publicFileUrl(relFromUploadRoot: string): string {
  const n = relFromUploadRoot.split(path.sep).join('/')
  return `/uploads/${n}`
}

function coerceBool(v: unknown, defaultValue: boolean): boolean {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return defaultValue
}

adminRouter.get('/stats', async (_req, res) => {
  const [videos, leads, services, tariffs, products] = await Promise.all([
    prisma.video.count(),
    prisma.lead.count(),
    prisma.service.count(),
    prisma.tariff.count(),
    prisma.product.count(),
  ])
  res.json({ videos, leads, services, tariffs, products })
})

adminRouter.get('/videos', async (_req, res) => {
  const list = await prisma.video.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  res.json({ videos: list })
})

adminRouter.post(
  '/videos',
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  async (req: AuthedRequest, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const poster = files?.poster?.[0]
    const videoFile = files?.video?.[0]
    const { title, category } = req.body as { title?: string; category?: string }
    if (!title || !category || !poster || !videoFile) {
      return res.status(400).json({ error: 'title, category, poster, video required' })
    }
    const upper = category.toUpperCase() as keyof typeof VideoCategory
    if (!VideoCategory[upper]) {
      return res.status(400).json({ error: 'invalid category' })
    }
    const posterUrl = publicFileUrl(path.relative(uploadRoot, poster.path))
    const videoUrl = publicFileUrl(path.relative(uploadRoot, videoFile.path))
    const v = await prisma.video.create({
      data: {
        title,
        category: VideoCategory[upper],
        posterUrl,
        videoUrl,
      },
    })
    res.status(201).json(v)
  },
)

adminRouter.patch('/videos/:id', async (req, res) => {
  const { id } = req.params
  const { title, category, published, sortOrder } = req.body as Record<
    string,
    unknown
  >
  const data: {
    title?: string
    published?: boolean
    sortOrder?: number
    category?: VideoCategory
  } = {}
  if (typeof title === 'string') data.title = title
  if (typeof published === 'boolean') data.published = published
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  if (typeof category === 'string') {
    const upper = category.toUpperCase() as keyof typeof VideoCategory
    if (VideoCategory[upper]) data.category = VideoCategory[upper]
  }
  try {
    const v = await prisma.video.update({ where: { id }, data })
    res.json(v)
  } catch {
    res.status(404).json({ error: 'not found' })
  }
})

adminRouter.delete('/videos/:id', async (req, res) => {
  const { id } = req.params
  const v = await prisma.video.findUnique({ where: { id } })
  if (!v) return res.status(404).json({ error: 'not found' })
  for (const u of [v.posterUrl, v.videoUrl]) {
    if (u.startsWith('/uploads/')) {
      const rel = u.replace('/uploads/', '')
      const fp = path.join(uploadRoot, rel)
      try {
        fs.unlinkSync(fp)
      } catch {
        /* ignore */
      }
    }
  }
  await prisma.video.delete({ where: { id } })
  res.status(204).end()
})

adminRouter.get('/services', async (_req, res) => {
  res.json({ services: await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } }) })
})

adminRouter.post('/services', async (req, res) => {
  const { title, description, iconKey, sortOrder, published } = req.body as Record<
    string,
    unknown
  >
  if (typeof title !== 'string' || typeof description !== 'string' || typeof iconKey !== 'string') {
    return res.status(400).json({ error: 'title, description, iconKey required' })
  }
  const s = await prisma.service.create({
    data: {
      title,
      description,
      iconKey,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      published: typeof published === 'boolean' ? published : true,
    },
  })
  res.status(201).json(s)
})

adminRouter.patch('/services/:id', async (req, res) => {
  const { id } = req.params
  const { title, description, iconKey, sortOrder, published } = req.body as Record<
    string,
    unknown
  >
  const data: Record<string, unknown> = {}
  if (typeof title === 'string') data.title = title
  if (typeof description === 'string') data.description = description
  if (typeof iconKey === 'string') data.iconKey = iconKey
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  if (typeof published === 'boolean') data.published = published
  const s = await prisma.service.update({ where: { id }, data })
  res.json(s)
})

adminRouter.delete('/services/:id', async (req, res) => {
  await prisma.service.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/advantages', async (_req, res) => {
  res.json({
    advantages: await prisma.advantage.findMany({ orderBy: { sortOrder: 'asc' } }),
  })
})

adminRouter.post('/advantages', async (req, res) => {
  const { title, description, iconKey, sortOrder, published } = req.body as Record<
    string,
    unknown
  >
  if (typeof title !== 'string' || typeof description !== 'string' || typeof iconKey !== 'string') {
    return res.status(400).json({ error: 'invalid' })
  }
  const a = await prisma.advantage.create({
    data: {
      title,
      description,
      iconKey,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      published: typeof published === 'boolean' ? published : true,
    },
  })
  res.status(201).json(a)
})

adminRouter.patch('/advantages/:id', async (req, res) => {
  const { title, description, iconKey, sortOrder, published } = req.body as Record<
    string,
    unknown
  >
  const data: Record<string, unknown> = {}
  if (typeof title === 'string') data.title = title
  if (typeof description === 'string') data.description = description
  if (typeof iconKey === 'string') data.iconKey = iconKey
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  if (typeof published === 'boolean') data.published = published
  const a = await prisma.advantage.update({ where: { id: req.params.id }, data })
  res.json(a)
})

adminRouter.delete('/advantages/:id', async (req, res) => {
  await prisma.advantage.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/tariffs', async (_req, res) => {
  const list = await prisma.tariff.findMany({ orderBy: { sortOrder: 'asc' } })
  res.json({
    tariffs: list.map((t) => ({ ...t, features: JSON.parse(t.features) as string[] })),
  })
})

adminRouter.post('/tariffs', async (req, res) => {
  const { name, price, description, features, highlighted, sortOrder, published } =
    req.body as Record<string, unknown>
  if (
    typeof name !== 'string' ||
    typeof price !== 'string' ||
    typeof description !== 'string' ||
    !Array.isArray(features)
  ) {
    return res.status(400).json({ error: 'invalid' })
  }
  const t = await prisma.tariff.create({
    data: {
      name,
      price,
      description,
      features: JSON.stringify(features),
      highlighted: Boolean(highlighted),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      published: typeof published === 'boolean' ? published : true,
    },
  })
  res.status(201).json({ ...t, features: JSON.parse(t.features) as string[] })
})

adminRouter.patch('/tariffs/:id', async (req, res) => {
  const { id } = req.params
  const { name, price, description, features, highlighted, sortOrder, published } =
    req.body as Record<string, unknown>
  const data: Record<string, unknown> = {}
  if (typeof name === 'string') data.name = name
  if (typeof price === 'string') data.price = price
  if (typeof description === 'string') data.description = description
  if (Array.isArray(features)) data.features = JSON.stringify(features)
  if (typeof highlighted === 'boolean') data.highlighted = highlighted
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  if (typeof published === 'boolean') data.published = published
  const t = await prisma.tariff.update({ where: { id }, data })
  res.json({ ...t, features: JSON.parse(t.features) as string[] })
})

adminRouter.delete('/tariffs/:id', async (req, res) => {
  await prisma.tariff.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/banner', async (_req, res) => {
  const b = await prisma.heroBanner.findUnique({ where: { id: 1 } })
  if (!b) return res.status(404).json({ error: 'not found' })
  res.json(b)
})

adminRouter.patch(
  '/banner',
  upload.fields([
    { name: 'previewImage', maxCount: 1 },
    { name: 'heroVideo', maxCount: 1 },
  ]),
  async (req: AuthedRequest, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const preview = files?.previewImage?.[0]
    const heroVid = files?.heroVideo?.[0]
    const {
      headline,
      subheadline,
      ctaPrimaryLabel,
      ctaPrimaryHref,
      ctaSecondaryLabel,
      ctaSecondaryHref,
      ctaBoxTitle,
      ctaBoxSubtitle,
      heroVideoUrl: heroVideoUrlBody,
      clearHeroVideo,
    } = req.body as Record<string, string | undefined>
    const data: Record<string, unknown> = {}
    if (headline !== undefined) data.headline = headline
    if (subheadline !== undefined) data.subheadline = subheadline
    if (ctaPrimaryLabel !== undefined) data.ctaPrimaryLabel = ctaPrimaryLabel
    if (ctaPrimaryHref !== undefined) data.ctaPrimaryHref = ctaPrimaryHref
    if (ctaSecondaryLabel !== undefined) data.ctaSecondaryLabel = ctaSecondaryLabel
    if (ctaSecondaryHref !== undefined) data.ctaSecondaryHref = ctaSecondaryHref
    if (ctaBoxTitle !== undefined) data.ctaBoxTitle = ctaBoxTitle
    if (ctaBoxSubtitle !== undefined) data.ctaBoxSubtitle = ctaBoxSubtitle
    if (preview) {
      data.previewImageUrl = publicFileUrl(path.relative(uploadRoot, preview.path))
    }
    if (heroVid) {
      data.heroVideoUrl = publicFileUrl(path.relative(uploadRoot, heroVid.path))
    } else if (heroVideoUrlBody !== undefined && heroVideoUrlBody.trim() !== '') {
      data.heroVideoUrl = heroVideoUrlBody.trim()
    }
    if (clearHeroVideo === '1' || clearHeroVideo === 'true') {
      data.heroVideoUrl = null
    }
    const b = await prisma.heroBanner.update({ where: { id: 1 }, data })
    res.json(b)
  },
)

adminRouter.get('/products', async (_req, res) => {
  res.json({ products: await prisma.product.findMany({ orderBy: { sortOrder: 'asc' } }) })
})

adminRouter.post('/products', upload.single('image'), async (req: AuthedRequest, res) => {
  const { title, description, sortOrder, published } = req.body as Record<string, unknown>
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ error: 'title, description required' })
  }
  let imageUrl: string | null = null
  if (req.file) {
    imageUrl = publicFileUrl(path.relative(uploadRoot, req.file.path))
  }
  const p = await prisma.product.create({
    data: {
      title,
      description,
      imageUrl,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : Number(sortOrder) || 0,
      published: coerceBool(published, true),
    },
  })
  res.status(201).json(p)
})

adminRouter.patch('/products/:id', upload.single('image'), async (req: AuthedRequest, res) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0]
  if (!id) return res.status(400).json({ error: 'invalid id' })
  const { title, description, sortOrder, published } = req.body as Record<string, unknown>
  const data: Prisma.ProductUpdateInput = {}
  if (typeof title === 'string') data.title = title
  if (typeof description === 'string') data.description = description
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  else if (sortOrder !== undefined && sortOrder !== null && sortOrder !== '')
    data.sortOrder = Number(sortOrder) || 0
  if (published !== undefined && published !== null && published !== '')
    data.published = coerceBool(published, true)
  if (req.file) {
    data.imageUrl = publicFileUrl(path.relative(uploadRoot, req.file.path))
  }
  const p = await prisma.product.update({ where: { id }, data })
  res.json(p)
})

adminRouter.delete('/products/:id', async (req, res) => {
  const p = await prisma.product.findUnique({ where: { id: req.params.id } })
  if (p?.imageUrl?.startsWith('/uploads/')) {
    const rel = p.imageUrl.replace('/uploads/', '')
    try {
      fs.unlinkSync(path.join(uploadRoot, rel))
    } catch {
      /* */
    }
  }
  await prisma.product.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/leads', async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
  res.json({ leads })
})

adminRouter.patch('/leads/:id', async (req, res) => {
  const { status } = req.body as { status?: string }
  if (!status) return res.status(400).json({ error: 'status required' })
  const upper = status.toUpperCase() as keyof typeof LeadStatus
  if (!LeadStatus[upper]) return res.status(400).json({ error: 'invalid status' })
  const l = await prisma.lead.update({
    where: { id: req.params.id },
    data: { status: LeadStatus[upper] },
  })
  res.json(l)
})

adminRouter.delete('/leads/:id', async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/chat-demo', async (_req, res) => {
  const lines = await prisma.chatDemoLine.findMany({ orderBy: { sortOrder: 'asc' } })
  res.json({ lines })
})

adminRouter.post('/chat-demo', async (req, res) => {
  const { text, side, sortOrder } = req.body as Record<string, unknown>
  if (typeof text !== 'string' || typeof side !== 'string') {
    return res.status(400).json({ error: 'text, side required' })
  }
  const upper = side.toUpperCase() as keyof typeof ChatSide
  if (!ChatSide[upper]) return res.status(400).json({ error: 'invalid side' })
  const line = await prisma.chatDemoLine.create({
    data: {
      text,
      side: ChatSide[upper],
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    },
  })
  res.status(201).json(line)
})

adminRouter.patch('/chat-demo/:id', async (req, res) => {
  const { text, side, sortOrder } = req.body as Record<string, unknown>
  const data: { text?: string; side?: ChatSide; sortOrder?: number } = {}
  if (typeof text === 'string') data.text = text
  if (typeof sortOrder === 'number') data.sortOrder = sortOrder
  if (typeof side === 'string') {
    const upper = side.toUpperCase() as keyof typeof ChatSide
    if (ChatSide[upper]) data.side = ChatSide[upper]
  }
  const line = await prisma.chatDemoLine.update({ where: { id: req.params.id }, data })
  res.json(line)
})

adminRouter.delete('/chat-demo/:id', async (req, res) => {
  await prisma.chatDemoLine.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ users })
})

adminRouter.post('/users', async (req, res) => {
  const { email, password, role } = req.body as { email?: string; password?: string; role?: string }
  if (!email?.trim() || !password || password.length < 6) {
    return res.status(400).json({ error: 'email and password (min 6 chars) required' })
  }
  const r = role === 'ADMIN' ? Role.ADMIN : Role.USER
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const u = await prisma.user.create({
      data: { email: email.trim().toLowerCase(), passwordHash, role: r },
      select: { id: true, email: true, role: true, createdAt: true },
    })
    res.status(201).json(u)
  } catch {
    res.status(400).json({ error: 'email already exists' })
  }
})

adminRouter.patch('/users/:id', async (req: AuthedRequest, res) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0]
  if (!id) return res.status(400).json({ error: 'invalid id' })
  const { role, password } = req.body as { role?: string; password?: string }
  const data: { role?: Role; passwordHash?: string } = {}
  if (role !== undefined) {
    const rk = role.toUpperCase() as keyof typeof Role
    if (!Role[rk]) return res.status(400).json({ error: 'invalid role' })
    data.role = Role[rk]
  }
  if (password != null && password !== '') {
    if (password.length < 6) return res.status(400).json({ error: 'password min 6 chars' })
    data.passwordHash = await bcrypt.hash(password, 10)
  }
  if (Object.keys(data).length === 0) return res.status(400).json({ error: 'nothing to update' })
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return res.status(404).json({ error: 'not found' })
  if (target.role === Role.ADMIN && data.role === Role.USER) {
    const admins = await prisma.user.count({ where: { role: Role.ADMIN } })
    if (admins <= 1) return res.status(400).json({ error: 'last admin cannot be demoted' })
  }
  const u = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, role: true, createdAt: true },
  })
  res.json(u)
})

adminRouter.delete('/users/:id', async (req: AuthedRequest, res) => {
  const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0]
  if (!id) return res.status(400).json({ error: 'invalid id' })
  if (id === req.userId) return res.status(400).json({ error: 'cannot delete yourself' })
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return res.status(404).json({ error: 'not found' })
  if (target.role === Role.ADMIN) {
    const admins = await prisma.user.count({ where: { role: Role.ADMIN } })
    if (admins <= 1) return res.status(400).json({ error: 'cannot delete last admin' })
  }
  await prisma.user.delete({ where: { id } })
  res.status(204).end()
})
