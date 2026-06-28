// src/services/api.js
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const portalApi = axios.create({ baseURL: '/api/portal' })
portalApi.interceptors.request.use(config => {
  const token = localStorage.getItem('clientToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
portalApi.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('clientToken')
    localStorage.removeItem('clientUser')
    window.location.href = '/portal/login'
  }
  return Promise.reject(err)
})

export default api
