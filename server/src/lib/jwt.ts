import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'

const secret = process.env.JWT_SECRET ?? 'dev-only-change-in-production'

export interface JwtPayload {
  sub: string
  role: Role
}

export function signToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as JwtPayload
  return decoded
}
