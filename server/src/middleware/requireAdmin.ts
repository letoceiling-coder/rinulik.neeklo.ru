import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'

export interface AuthedRequest extends Request {
  userId?: string
  userRole?: string
}

export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const h = req.headers.authorization
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const { sub, role } = verifyToken(token)
    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const user = await prisma.user.findUnique({ where: { id: sub } })
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' })
    }
    req.userId = sub
    req.userRole = role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
