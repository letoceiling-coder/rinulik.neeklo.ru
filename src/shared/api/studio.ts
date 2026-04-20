import { apiFetch, apiUploadForm } from './client'
import type { StudioCatalog, StudioJob, StudioUser } from './types'

export async function fetchStudioMe() {
  return apiFetch<{ user: StudioUser }>('/api/studio/me')
}

export async function fetchStudioCatalog() {
  return apiFetch<StudioCatalog>('/api/studio/models')
}

export async function fetchStudioJobs() {
  return apiFetch<{ jobs: StudioJob[] }>('/api/studio/jobs')
}

export async function fetchStudioJob(id: string) {
  return apiFetch<{ job: StudioJob }>(`/api/studio/jobs/${id}`)
}

export async function postGenerate(modelId: string, params: Record<string, unknown>) {
  return apiFetch<{ job: StudioJob }>('/api/studio/generate', {
    method: 'POST',
    json: { modelId, params },
  })
}

export async function deleteJob(id: string) {
  return apiFetch<void>(`/api/studio/jobs/${id}`, { method: 'DELETE' })
}

export async function uploadReference(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  return apiUploadForm<{ url: string; absoluteUrl: string }>('/api/studio/upload', fd)
}
