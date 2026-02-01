import { create } from 'zustand'
import type { Data, UploadState } from '@/types'

type ViewType = 'app' | 'api-docs'

// Get saved language from localStorage
const getSavedLanguage = (): 'zh' | 'en' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('position-doctor-language')
    if (saved === 'zh' || saved === 'en') {
      return saved
    }
  }
  return 'zh' // 默认中文
}

interface AppState {
  // UI State
  uploadState: UploadState
  uploadProgress: number
  errorMessage: string | null
  language: 'zh' | 'en'
  apiModalOpen: boolean
  currentView: ViewType

  // Data
  resultData: Data | null
  processingTimeMs: number | null

  // Actions
  setUploadState: (state: UploadState) => void
  setUploadProgress: (progress: number) => void
  setError: (message: string | null) => void
  setResultData: (data: Data, processingTimeMs?: number) => void
  setLanguage: (lng: 'zh' | 'en') => void
  toggleApiModal: () => void
  setView: (view: ViewType) => void
  reset: () => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  uploadState: 'idle',
  uploadProgress: 0,
  errorMessage: null,
  language: getSavedLanguage(), // 从 localStorage 读取
  apiModalOpen: false,
  currentView: 'app',
  resultData: null,
  processingTimeMs: null,

  // Actions
  setUploadState: (uploadState) => set({ uploadState }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setError: (errorMessage) => set({ errorMessage }),
  setResultData: (resultData, processingTimeMs) => set({ resultData, processingTimeMs: processingTimeMs ?? null }),
  setLanguage: (language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('position-doctor-language', language)
    }
    set({ language })
  },
  toggleApiModal: () => set((state) => ({ apiModalOpen: !state.apiModalOpen })),
  setView: (currentView) => set({ currentView }),
  reset: () =>
    set({
      uploadState: 'idle',
      uploadProgress: 0,
      errorMessage: null,
      resultData: null,
      processingTimeMs: null,
    }),
}))
