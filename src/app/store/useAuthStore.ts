import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/shared/api/types'
import { apiFetch } from '@/shared/api/client'

const STORAGE_KEY = 'generateai-auth'

interface AuthState {
  token: string | null
  user: AuthUser | null
  bootstrapped: boolean
  setAuth: (token: string, user: AuthUser) => void
  logout: () => void
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      bootstrapped: false,
      setAuth: (token, user) => {
        set({ token, user, bootstrapped: true })
      },
      logout: () => {
        set({ token: null, user: null, bootstrapped: true })
      },
      bootstrap: async () => {
        const { token } = get()
        if (!token) {
          set({ user: null, bootstrapped: true })
          return
        }
        try {
          const data = await apiFetch<{ user: AuthUser }>('/api/auth/me')
          set({ user: data.user, bootstrapped: true })
        } catch {
          set({ token: null, user: null, bootstrapped: true })
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ token: s.token }),
    },
  ),
)
