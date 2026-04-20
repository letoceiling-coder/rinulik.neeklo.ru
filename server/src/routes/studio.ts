import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma.js'
import { requireUser } from '../middleware/requireUser.js'
import type { AuthedRequest } from '../middleware/requireAdmin.js'
import {
  findModel,
  publicCatalog,
  type ModelDef,
} from '../lib/modelCatalog.js'
import {
  fluxDevCreate,
  fluxDevGet,
  klingV25Create,
  klingV25Get,
  mysticCreate,
  mysticGet,
  seedanceCreate,
  seedanceGet,
  type FreepikEnvelope,
  type FreepikTask,
} from '../lib/freepik.js'

export const studioRouter = Router()

// --- uploads/user/<userId>/ --------------------------------------------------
const uploadsRoot = path.resolve(process.cwd(), 'uploads')
const userUploadsRoot = path.join(uploadsRoot, 'user')
if (!fs.existsSync(userUploadsRoot)) fs.mkdirSync(userUploadsRoot, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as AuthedRequest).userId
    if (!userId) return cb(new Error('no user'), '')
    const dir = path.join(userUploadsRoot, userId)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB (Freepik предел ~10MB)
})

// --- helpers -----------------------------------------------------------------

function publicUrl(req: AuthedRequest): string {
  // Абсолютный URL до нашего origin (Freepik должен иметь доступ по HTTP/HTTPS)
  const envOrigin = process.env.FRONTEND_ORIGIN?.split(',')[0]?.replace(/\/$/, '')
  if (envOrigin) return envOrigin
  const host = req.get('host') ?? 'localhost'
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http'
  return `${proto}://${host}`
}

async function rollDailyReset(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return null
  const now = new Date()
  const last = new Date(user.dailyResetAt)
  const dayMs = 24 * 60 * 60 * 1000
  if (now.getTime() - last.getTime() >= dayMs) {
    return prisma.user.update({
      where: { id: userId },
      data: { dailyUsed: 0, dailyResetAt: now },
    })
  }
  return user
}

function parseResult(task: FreepikTask | undefined): string[] | null {
  if (!task?.generated || task.generated.length === 0) return null
  return task.generated
}

async function callCreate(model: ModelDef, params: Record<string, unknown>) {
  if (model.id === 'mystic') {
    const r = await mysticCreate(params as never)
    return r.data
  }
  if (model.id === 'flux-dev') {
    const r = await fluxDevCreate(params as never)
    return r.data
  }
  if (model.id === 'kling-v2-5-pro') {
    const r = await klingV25Create(params as never)
    return r.data
  }
  if (model.id === 'seedance-pro-1080p') {
    const r = await seedanceCreate(params as never)
    return r.data
  }
  throw new Error(`Unknown model ${model.id}`)
}

async function callGet(modelId: string, taskId: string): Promise<FreepikEnvelope<FreepikTask>> {
  switch (modelId) {
    case 'mystic':
      return mysticGet(taskId)
    case 'flux-dev':
      return fluxDevGet(taskId)
    case 'kling-v2-5-pro':
      return klingV25Get(taskId)
    case 'seedance-pro-1080p':
      return seedanceGet(taskId)
    default:
      throw new Error('unknown model')
  }
}

function mapStatus(s: FreepikTask['status']): 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' {
  return s
}

// --- routes ------------------------------------------------------------------

/** Публичный каталог моделей (без secret'ов) — доступен после логина. */
studioRouter.get('/models', requireUser, (_req, res) => {
  res.json(publicCatalog())
})

/** Информация о текущем пользователе для студии — баланс, дневной лимит. */
studioRouter.get('/me', requireUser, async (req: AuthedRequest, res) => {
  const user = await rollDailyReset(req.userId!)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      credits: user.credits,
      dailyCredits: user.dailyCredits,
      dailyUsed: user.dailyUsed,
      dailyResetAt: user.dailyResetAt,
    },
  })
})

/** Загрузка референса (image-to-video, style/structure reference). */
studioRouter.post(
  '/upload',
  requireUser,
  upload.single('file'),
  async (req: AuthedRequest, res) => {
    if (!req.file) return res.status(400).json({ error: 'file required' })
    const rel = `/uploads/user/${req.userId}/${req.file.filename}`
    await prisma.usageLog.create({
      data: { userId: req.userId!, action: 'upload_reference', cost: 0 },
    })
    res.json({ url: rel, absoluteUrl: `${publicUrl(req)}${rel}` })
  },
)

/** Запуск генерации. */
studioRouter.post('/generate', requireUser, async (req: AuthedRequest, res) => {
  const { modelId, params } = req.body as { modelId?: string; params?: Record<string, unknown> }
  if (!modelId) return res.status(400).json({ error: 'modelId required' })
  const model = findModel(modelId)
  if (!model) return res.status(400).json({ error: 'Unknown model' })
  const payload: Record<string, unknown> = { ...(params ?? {}) }

  // базовая валидация prompt
  const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim() : ''
  if (!prompt && model.id !== 'mystic') {
    return res.status(400).json({ error: 'prompt is required' })
  }
  if (prompt) payload.prompt = prompt

  // image-to-video: разрешим присылать относительный /uploads/... — превратим в абсолютный
  if (typeof payload.image === 'string' && payload.image.startsWith('/uploads/')) {
    payload.image = `${publicUrl(req)}${payload.image}`
  }
  if (model.requiresReferenceImage && !payload.image) {
    return res.status(400).json({ error: 'image reference is required for this model' })
  }

  // квоты
  const user = await rollDailyReset(req.userId!)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  const cost = model.credits
  const hasDaily = user.dailyUsed + cost <= user.dailyCredits
  const hasExtra = user.credits >= cost
  if (!hasDaily && !hasExtra) {
    return res.status(402).json({
      error: 'Недостаточно кредитов. Сегодня использовано ' + user.dailyUsed + ' / ' + user.dailyCredits,
    })
  }

  // Создаём job сразу в QUEUED, затем зовём Freepik
  const job = await prisma.generationJob.create({
    data: {
      userId: req.userId!,
      kind: model.kind,
      modelId: model.id,
      status: 'QUEUED',
      prompt: prompt || '(empty)',
      params: JSON.stringify(payload),
      creditsCost: cost,
    },
  })

  try {
    const data = await callCreate(model, payload)
    const updated = await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: mapStatus(data.status),
        freepikTaskId: data.task_id,
      },
    })
    // списание кредитов: сначала дневной лимит, потом overflow в `credits`
    const dailyInc = Math.min(cost, Math.max(0, user.dailyCredits - user.dailyUsed))
    const extraDec = cost - dailyInc
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyUsed: { increment: dailyInc },
        credits: { decrement: extraDec },
      },
    })
    await prisma.usageLog.create({
      data: {
        userId: user.id,
        jobId: job.id,
        action: model.kind === 'IMAGE' ? 'generate_image' : 'generate_video',
        modelId: model.id,
        cost,
      },
    })
    res.status(201).json({ job: serialiseJob(updated) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Freepik error'
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', errorMessage: msg.slice(0, 500) },
    })
    res.status(502).json({ error: msg })
  }
})

/** Список задач пользователя (история). */
studioRouter.get('/jobs', requireUser, async (req: AuthedRequest, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 50)))
  const jobs = await prisma.generationJob.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  res.json({ jobs: jobs.map(serialiseJob) })
})

/** Чтение одной задачи с подтягиванием статуса из Freepik при необходимости. */
studioRouter.get('/jobs/:id', requireUser, async (req: AuthedRequest, res) => {
  const rawId = req.params.id
  const id = typeof rawId === 'string' ? rawId : rawId?.[0]
  if (!id) return res.status(400).json({ error: 'invalid id' })
  const job = await prisma.generationJob.findUnique({ where: { id } })
  if (!job || job.userId !== req.userId) return res.status(404).json({ error: 'not found' })

  if (
    job.freepikTaskId &&
    (job.status === 'CREATED' || job.status === 'IN_PROGRESS' || job.status === 'QUEUED')
  ) {
    try {
      const { data } = await callGet(job.modelId, job.freepikTaskId)
      const resultUrls = parseResult(data)
      const updated = await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: mapStatus(data.status),
          resultUrls: resultUrls ? JSON.stringify(resultUrls) : job.resultUrls,
        },
      })
      return res.json({ job: serialiseJob(updated) })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'poll error'
      const updated = await prisma.generationJob.update({
        where: { id: job.id },
        data: { status: 'FAILED', errorMessage: msg.slice(0, 500) },
      })
      return res.json({ job: serialiseJob(updated) })
    }
  }

  res.json({ job: serialiseJob(job) })
})

/** Удаление из истории (не отменяет задачу у Freepik). */
studioRouter.delete('/jobs/:id', requireUser, async (req: AuthedRequest, res) => {
  const rawId = req.params.id
  const id = typeof rawId === 'string' ? rawId : rawId?.[0]
  if (!id) return res.status(400).json({ error: 'invalid id' })
  const job = await prisma.generationJob.findUnique({ where: { id } })
  if (!job || job.userId !== req.userId) return res.status(404).json({ error: 'not found' })
  await prisma.generationJob.delete({ where: { id } })
  res.status(204).end()
})

function serialiseJob(job: Awaited<ReturnType<typeof prisma.generationJob.findFirstOrThrow>>) {
  let params: unknown = {}
  try {
    params = JSON.parse(job.params)
  } catch {
    params = {}
  }
  let resultUrls: string[] = []
  try {
    if (job.resultUrls) resultUrls = JSON.parse(job.resultUrls) as string[]
  } catch {
    resultUrls = []
  }
  return {
    id: job.id,
    kind: job.kind,
    modelId: job.modelId,
    status: job.status,
    prompt: job.prompt,
    params,
    resultUrls,
    creditsCost: job.creditsCost,
    freepikTaskId: job.freepikTaskId,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}
