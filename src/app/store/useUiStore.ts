import { create } from 'zustand'

interface UiState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (value: boolean) => void
  /** Имитация прогресса генерации видео (0–100), шаг 4+ */
  generationProgress: number | null
  setGenerationProgress: (value: number | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  generationProgress: null,
  setGenerationProgress: (generationProgress) => set({ generationProgress }),
}))
