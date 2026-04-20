/**
 * Клиент Freepik API. Ключ читается строго из FREEPIK_API_KEY (серверный .env).
 * Никогда не проксируется на фронт и не попадает в ответы API.
 *
 * Работает универсально: путь эндпоинта конкретной модели описывается
 * в modelCatalog.ts (поле `endpoint`, напр. "text-to-image/flux-dev" или "mystic").
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
      const j = JSON.parse(text) as { message?: string; detail?: string; error?: string }
      message = j.message || j.detail || j.error || message
    } catch {
      message = text.slice(0, 400) || message
    }
    throw new Error(message)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

function normEndpoint(ep: string): string {
  const clean = ep.replace(/^\/+|\/+$/g, '')
  return clean.startsWith('v1/') ? `/${clean}` : `/v1/ai/${clean}`
}

export function freepikCreate(endpoint: string, body: unknown) {
  return request<FreepikEnvelope<FreepikTask>>('POST', normEndpoint(endpoint), body)
}

export function freepikGet(endpoint: string, taskId: string) {
  return request<FreepikEnvelope<FreepikTask>>('GET', `${normEndpoint(endpoint)}/${taskId}`)
}
