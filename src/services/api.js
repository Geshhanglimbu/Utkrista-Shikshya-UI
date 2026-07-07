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
      // FIX: "Sandip" thiyo yaha — auth scheme name huna paryo, "Bearer" garako
      config.headers.Authorization = `Sandip ${token}`;
    }

   
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
        // FIX: "Place verify" typo thiyo, "Please verify" garako
        toast.error("Network error. Please verify connection and try again.");
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
    addRoleByEmail: (email, role, config) =>api.post(`/users/addRole/email/${encodeURIComponent(email)}/role/${encodeURIComponent(role)}`, null, config)
  };

  export const categoryService = {
    getAll: (config) => api.get('/categories/', config),
    create: (data, config) => api.post('/categories/', data, config),
    update: (id, data, config) => api.put(`/categories/${id}`, data, config),
    uploadFile: (id, formData) => api.post(`/categories/file/upload/${id}`, formData), 
    searchByTitle: (title, config) => api.get(`/categories/search/title/${encodeURIComponent(title)}`, config),
    searchByMain: (mainCategory, config) =>api.get(`/categories/search/main/${encodeURIComponent(mainCategory)}`, config),
    remove: (catId, config) => api.delete(`/categories/${catId}`, config),
  }

  export const paymentService = {
    checkPayment: (userId, categoryId, config) => api.get(`/payment/check/user/${userId}/category/${categoryId}`, config),
    approve: (id, config) => api.post(`/payment/approve/${id}`, null, config),
    reject: (id, config) => api.post(`/payment/reject/${id}`, null, config),
    getMonthlyRevenue: (config) => api.get("/payment/monthly/revenue", config),
  }

  export const contentService = {
    create: (userId, categoryId, data, config) => api.post(`/user/${userId}/category/${categoryId}/posts`, data, config),
    getByCategoryId: (categoryId, config) => api.get(`/category/${categoryId}`, config),
    update: (id, data, config) => api.put(`/posts/${id}`, data, config),
    getByCategoryTitle: (title, config) => api.get(`/categories/search/title/${encodeURIComponent(title)}`, config),
    // ADDED: yi duita missing thiye — Content.jsx le call gardai thiyo tara api.js ma exist nai gareko thiyena.
    // Naming pattern categoryService jasto nai rakheko (posts/file/upload/:id). Backend ma actual route
    // farak vaye yaha path matra change garnu paro.
    remove: (id, config) => api.delete(`/posts/${id}`, config),
    uploadFile: (id, formData) =>api.post(`/post/file/upload/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }),

  getFileUrl: (imageName) =>`${api.defaults.baseURL}/post/image/${imageName}`,
  getById: (id, config) =>
    api.get(`/posts/${id}`, config),

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