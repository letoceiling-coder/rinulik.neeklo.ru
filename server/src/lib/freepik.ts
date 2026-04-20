/**
 * Клиент Freepik API. Ключ читается строго из FREEPIK_API_KEY (серверный .env).
 * Никогда не проксируется на фронт и не попадает в ответы API.
 */

const DEFAULT_BASE = 'https://api.freepik.com'

function apiKey(): string {
  const k = process.env.FREEPIK_API_KEY
  if (!k) throw new Error('FREEPIK_API_KEY is not set')
  return k
}

function baseUrl(): string {
  return (process.env.FREEPIK_BASE_URL || DEFAULT_BASE).replace(/\/$/, '')
}

export interface FreepikTask {
  task_id: string
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  generated?: string[]
  has_nsfw?: boolean[]
}

export interface FreepikEnvelope<T> {
  data: T
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    method,
    headers: {
      'x-freepik-api-key': apiKey(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    let message = `Freepik ${res.status}`
    try {
      const j = JSON.parse(text) as { message?: string; detail?: string }
      message = j.message || j.detail || message
    } catch {
      message = text.slice(0, 400) || message
    }
    throw new Error(message)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

// --- Mystic (text -> image) ---

export interface MysticCreatePayload {
  prompt: string
  resolution?: '1k' | '2k' | '4k'
  aspect_ratio?: string
  model?: 'realism' | 'fluid' | 'zen' | 'flexible' | 'super_real' | 'editorial_portraits'
  structure_reference?: string // base64
  style_reference?: string // base64
  structure_strength?: number
  adherence?: number
  hdr?: number
  webhook_url?: string
}

export function mysticCreate(p: MysticCreatePayload) {
  return request<FreepikEnvelope<FreepikTask>>('POST', '/v1/ai/mystic', p)
}
export function mysticGet(taskId: string) {
  return request<FreepikEnvelope<FreepikTask>>('GET', `/v1/ai/mystic/${taskId}`)
}

// --- Flux Dev (text -> image) ---

export interface FluxDevPayload {
  prompt: string
  aspect_ratio?: string
  seed?: number
  styling?: Record<string, unknown>
  webhook_url?: string
}

export function fluxDevCreate(p: FluxDevPayload) {
  return request<FreepikEnvelope<FreepikTask>>('POST', '/v1/ai/text-to-image/flux-dev', p)
}
export function fluxDevGet(taskId: string) {
  return request<FreepikEnvelope<FreepikTask>>('GET', `/v1/ai/text-to-image/flux-dev/${taskId}`)
}

// --- Kling 2.5 Pro (image -> video) ---

export interface KlingV25Payload {
  image: string // URL или base64
  prompt?: string
  negative_prompt?: string
  duration: '5' | '10'
  cfg_scale?: number
  webhook_url?: string
}

export function klingV25Create(p: KlingV25Payload) {
  return request<FreepikEnvelope<FreepikTask>>('POST', '/v1/ai/image-to-video/kling-v2-5-pro', p)
}
export function klingV25Get(taskId: string) {
  return request<FreepikEnvelope<FreepikTask>>(
    'GET',
    `/v1/ai/image-to-video/kling-v2-5-pro/${taskId}`,
  )
}

// --- Seedance Pro 1080p (image -> video) ---

export interface SeedancePayload {
  image?: string
  prompt: string
  duration?: '5' | '10'
  camera_fixed?: boolean
  aspect_ratio?: string
  seed?: number
  webhook_url?: string
}

export function seedanceCreate(p: SeedancePayload) {
  return request<FreepikEnvelope<FreepikTask>>('POST', '/v1/ai/image-to-video/seedance-pro-1080p', p)
}
export function seedanceGet(taskId: string) {
  return request<FreepikEnvelope<FreepikTask>>(
    'GET',
    `/v1/ai/image-to-video/seedance-pro-1080p/${taskId}`,
  )
}
