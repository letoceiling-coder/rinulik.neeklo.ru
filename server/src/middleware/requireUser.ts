import type { NextFunction, Response } from 'express'
import { verifyToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'
import type { AuthedRequest } from './requireAdmin.js'

/** Пропускает любого залогиненного пользователя (USER или ADMIN). */
export async function requireUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const h = req.headers.authorization
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { sub, role } = verifyToken(token)
    const user = await prisma.user.findUnique({ where: { id: sub } })
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    req.userId = sub
    req.userRole = role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
