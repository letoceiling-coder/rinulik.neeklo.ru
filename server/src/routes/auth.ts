import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import type { AuthedRequest } from '../middleware/requireAdmin.js'
import { verifyToken } from '../lib/jwt.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'email and password required' })
  }
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = signToken(user.id, user.role)
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  })
})

authRouter.post('/register', async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
  } = req.body as {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
  }
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'email and password required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль должен быть минимум 6 символов' })
  }
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (exists) {
    return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: 'USER',
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      dailyCredits: 50,
      dailyUsed: 0,
      credits: 0,
      dailyResetAt: new Date(),
    },
  })
  const token = signToken(user.id, user.role)
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  })
})

authRouter.get('/me', async (req: AuthedRequest, res) => {
  const h = req.headers.authorization
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const { sub } = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    })
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    res.json({ user })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
})
