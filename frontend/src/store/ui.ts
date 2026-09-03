import { create } from 'zustand'

type Theme = 'light' | 'dark'
type Lang = 'en' | 'ru' | 'uz'

interface UiState {
  theme: Theme
  lang: Lang
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setLang: (l: Lang) => void
  init: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useUi = create<UiState>((set, get) => ({
  theme: 'light',
  lang: 'en',

  init: () => {
    const theme = (localStorage.getItem('theme') as Theme) || 'light'
    const lang = (localStorage.getItem('lang') as Lang) || 'en'
    applyTheme(theme)
    set({ theme, lang })
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    get().setTheme(next)
  },

  setLang: (lang) => {
    localStorage.setItem('lang', lang)
    set({ lang })
  },
}))
