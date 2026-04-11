import { useAuthStore } from '@/app/store/useAuthStore'

const base = () => import.meta.env.VITE_API_URL ?? ''

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers)
  const token = useAuthStore.getState().token
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init?.json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const { json, ...rest } = init ?? {}
  const r = await fetch(`${base()}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  if (r.status === 204) return undefined as T
  const ct = r.headers.get('content-type') ?? ''
  const bodyText = await r.text()
  if (!r.ok) {
    try {
      const err = JSON.parse(bodyText) as { error?: string }
      throw new Error(err.error ?? r.statusText)
    } catch {
      throw new Error(bodyText || r.statusText)
    }
  }
  if (ct.includes('application/json') && bodyText) {
    return JSON.parse(bodyText) as T
  }
  return bodyText as T
}

/** URL для /uploads/... и других путей: при пустом VITE_API_URL — абсолютный origin (иначе nginx может не отдать файлы со SPA). */
export function assetUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const b = base().replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  if (b) return `${b}${path}`
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`
  return path
}

export async function apiUploadForm<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
  const headers = new Headers()
  const token = useAuthStore.getState().token
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const r = await fetch(`${base()}${path}`, { method, headers, body: formData })
  if (r.status === 204) return undefined as T
  const bodyText = await r.text()
  if (!r.ok) {
    try {
      const err = JSON.parse(bodyText) as { error?: string }
      throw new Error(err.error ?? r.statusText)
    } catch {
      throw new Error(bodyText || r.statusText)
    }
  }
  if (!bodyText) return undefined as T
  return JSON.parse(bodyText) as T
}
