import { create } from 'zustand'
import api from '../lib/api'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: Record<string, string>) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  updateProfile: (data: FormData | Record<string, unknown>) => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  login: async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    const me = await api.get('/auth/me/')
    set({ user: me.data })
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register/', payload)
    localStorage.setItem('access', data.access)
    localStorage.setItem('refresh', data.refresh)
    set({ user: data.user })
  },

  logout: () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    set({ user: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      set({ user: null, loading: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me/')
      set({ user: data, loading: false })
    } catch {
      set({ user: null, loading: false })
    }
  },

  updateProfile: async (payload) => {
    const { data } = await api.patch('/auth/me/', payload, {
      headers: payload instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined,
    })
    set({ user: data })
  },
}))
