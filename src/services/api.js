import axios from 'axios'

// Central Axios instance. Swap baseURL with your real backend when ready.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://elp.mytufan.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authService = {
  login: (data) => api.post("/auth/login", data),
  sendOtp: (data) => api.post("/auth/get-phone-number", data),
  register: (data) => api.post("/auth/register", data),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
}

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  approve: (id) => api.post(`/payments/${id}/approve`),
  reject: (id) => api.post(`/payments/${id}/reject`),
}

export const contentService = {
  getAll: (params) => api.get('/content', { params }),
  upload: (formData) => api.post('/content/upload', formData),
  remove: (id) => api.delete(`/content/${id}`),
}

export const liveClassService = {
  getAll: () => api.get('/live-classes'),
  create: (data) => api.post('/live-classes', data),
}

export const bannerService = {
  getAll: () => api.get('/banners'),
  upload: (formData) => api.post('/banners', formData),
  remove: (id) => api.delete(`/banners/${id}`),
}

export default api
