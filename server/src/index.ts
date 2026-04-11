import 'dotenv/config'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import { publicRouter } from './routes/public.js'
import { authRouter } from './routes/auth.js'
import { adminRouter } from './routes/admin.js'

const app = express()
const uploadRoot = path.resolve(process.cwd(), 'uploads')

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',') ?? true,
    credentials: true,
  }),
)
app.use(express.json())
app.use('/uploads', express.static(uploadRoot))

app.use('/api/public', publicRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(process.cwd(), 'dist')
  app.use(express.static(dist, { index: false }))
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.sendFile(path.join(dist, 'index.html'))
  })
}

const port = Number(process.env.PORT ?? 4000)
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on :${port} (${process.env.NODE_ENV ?? 'development'})`)
})
