import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/')
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const trafficAPI = {
  list: (limit = 100) => api.get(`/traffic/?limit=${limit}`),
  add: (data) => api.post('/traffic/', data),
}

export const predictionAPI = {
  predict: (data) => api.post('/prediction/predict', data),
  train: () => api.post('/prediction/train'),
  trainUpload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/prediction/train/upload', form)
  },
  modelInfo: () => api.get('/prediction/model-info'),
  history: (limit = 50) => api.get(`/prediction/history?limit=${limit}`),
}

export const routeAPI = {
  optimize: (data) => api.post('/route/optimize', data),
  locations: () => api.get('/route/locations'),
}

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  analytics: () => api.get('/dashboard/analytics'),
  heatmap: () => api.get('/dashboard/heatmap'),
}

export default api
