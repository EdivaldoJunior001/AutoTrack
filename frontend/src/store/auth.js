// src/store/auth.js
import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isLoggedIn: s => !!s.token,
    isAdmin: s => s.user?.role === 'ADMIN'
  },
  actions: {
    async login(email, password) {
      this.loading = true; this.error = null
      try {
        const { data } = await api.post('/auth/login', { email, password })
        this.token = data.token; this.user = data.user
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } catch (e) {
        this.error = e.response?.data?.error || 'Erro ao fazer login'
        return false
      } finally { this.loading = false }
    },
    logout() {
      this.token = null; this.user = null
      localStorage.removeItem('token'); localStorage.removeItem('user')
    }
  }
})
