import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../lib/jwt.js'
import type { AuthedRequest } from '../middleware/requireAdmin.js'
import { verifyToken } from '../lib/jwt.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' })
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const token = signToken(user.id, user.role)
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
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
      select: { id: true, email: true, role: true },
    })
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    res.json({ user })
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
})
