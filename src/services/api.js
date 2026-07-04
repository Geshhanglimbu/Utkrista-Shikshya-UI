import axios from 'axios'
import { toast } from 'react-toastify'

// Central Axios instance. Swap baseURL with your real backend when ready.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://elp.mytufan.com/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Sandip ${token}`;
  }

  // FormData huda default JSON content-type hataune, axios lai auto-detect garna dine
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config;
});

// Central response interceptor for handling 401, 403, 404, 405, and 429 responses gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.error || error.message || "An error occurred";

      switch (status) {
        case 401:
          toast.error("Session expired or Unauthorized. Please log in again.");
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          toast.error("Forbidden. You do not have permission for this action.");
          break;
        case 404:
          toast.error(`Not Found: ${message}`);
          break;
        case 405:
          toast.error("HTTP Method Not Allowed.");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        default:
          // Other status codes can be handled by individual pages
          break;
      }
    } else if (error.request) {
      toast.error("Network error. Place verify connection and try again.");
    } else {
      toast.error(`Request Error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data, config) => api.post("/auth/login", data, config),
  sendOtp: (data, config) => api.post("/auth/get-phone-number", data, config),
  register: (data, config) => api.post("/auth/register", data, config),
};

export const userService = {
  getAll: (params, config) => api.get("/users/", { params, ...config }),
  getById: (id, config) => api.get(`/users/${id}`, config),
  update: (id, data, config) => api.put(`/users/${id}`, data, config),
  remove: (id, config) => api.delete(`/users/${id}`, config),
  addRoleByEmail: (email, role, config) =>
    api.post(`/users/addRole/email/${encodeURIComponent(email)}/role/${encodeURIComponent(role)}`, null, config)
};

export const categoryService = {
  getAll: (config) => api.get('/categories/', config),
  create: (data, config) => api.post('/categories/', data, config),
  update: (id, data, config) => api.put(`/categories/${id}`, data, config),
  uploadFile: (id, formData) => api.post(`/categories/file/upload/${id}`, formData), 
  remove: (id, config) => api.delete(`/categories/${id}`, config),
}

export const paymentService = {
  checkPayment: (userId, categoryId, config) => api.get(`/payment/check/user/${userId}/category/${categoryId}`, config),
  approve: (id, config) => api.post(`/payment/approve/${id}`, null, config),
  reject: (id, config) => api.post(`/payment/reject/${id}`, null, config),
}

export const contentService = {
  getAll: (params, config) => api.get('/content', { params, ...config }),
  upload: (formData, config) => api.post('/content/upload', formData, config),
  remove: (id, config) => api.delete(`/content/${id}`, config),
}

export const liveClassService = { 
  getAll: (params, config) => api.get("/lives", { params, ...config }),
  create: (userId, categoryId, data, config) => api.post(`/user/${userId}/category/${categoryId}/lives`, data, config),
}

export const bannerService = {
  getAll: (config) => api.get('/banners', config),
  upload: (formData, config) => api.post('/banners', formData, config),
  remove: (id, config) => api.delete(`/banners/${id}`, config),
}

export default api
