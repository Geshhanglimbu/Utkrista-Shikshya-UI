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
  // Get all categories
  getAll: (config) => api.get('/categories/', config),

  // Get category by ID
  getById: (id, config) => api.get(`/categories/${id}`, config),

  // Get latest categories
  getLatest: (config) => api.get('/categories/latest', config),

  // Create category
  create: (data, config) => api.post('/categories/', data, config),

  // Update category
  update: (id, data, config) => api.put(`/categories/${id}`, data, config),

  // Delete category
  remove: (catId, config) => api.delete(`/categories/${catId}`, config),

  // Upload category image/file
  uploadFile: (id, formData) =>
    api.post(`/categories/file/upload/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get uploaded category image/file
  getImage: (fileName, config) =>
    api.get(`/categories/image/${fileName}`, {
      ...config,
      responseType: "blob",
    }),

  // Search by category title
  searchByTitle: (title, config) =>
    api.get(
      `/categories/search/title/${encodeURIComponent(title)}`,
      config
    ),

  // Search by main category
  searchByMain: (mainCategory, config) =>
    api.get(
      `/categories/search/main/${encodeURIComponent(mainCategory)}`,
      config
    ),

  // Search by both title and main category
  search: (keyword, config) =>
    api.get(
      `/categories/search/${encodeURIComponent(keyword)}`,
      config
    ),
};
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
  // Get all live classes
  getAll: (params, config) =>
    api.get("/lives", { params, ...config }),

  // Get all live classes by category ID
  getByCategoryId: (categoryId, config) =>
    api.get(`/category/${categoryId}/lives/`, config),

  // Create a live class
  create: (userId, categoryId, data, config) =>
    api.post(`/user/${userId}/category/${categoryId}/lives`, data, config),

  // Update a live class
  update: (id, data, config) =>
    api.put(`/lives/${id}`, data, config),

  // Delete a live class
  remove: (id, config) =>
    api.delete(`/live/${id}`, config),
}
// ======================
// Exam Service
// ======================

export const examService = {
  // Create Exam
  create: (userId, categoryId, data) =>
    api.post(`/user/${userId}/category/${categoryId}/exams`, data),

  // Get All Exams
  getAll: () =>
    api.get("/exams"),

  // Get Exam By Category
  getByCategory: (categoryId) =>
    api.get(`/exams/${categoryId}`),

  // Upload Exam Image/File
  uploadFile: (examId, formData) =>
    api.post(`/exam/file/upload/${examId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Get Exam Image/File
  getFile: (fileName) =>
    api.get(`/exam/file/${fileName}`, {
      responseType: "blob",
    }),

  // Update Exam
  update: (examId, data) =>
    api.put(`/exams/${examId}`, data),

  // Delete Exam (if available)
  remove: (examId) =>
    api.delete(`/exams/${examId}`),
};

// ======================
// Booking Service
// ======================

export const bookingService = {
  // Create Booking
  create: (userId, categoryId, data, config) =>
    api.post(`/user/${userId}/category/${categoryId}/bookeds`, data, config),

  // Get All Bookings
  getAll: (params, config) =>
    api.get("/bookeds", { params, ...config }),

  // Get Bookings By User ID
  getByUserId: (userId, config) =>
    api.get(`/booked/user/${userId}`, config),

  // Check Booking Status
  checkBooked: (userId, categoryId, config) =>
    api.get(`/check/user/${userId}/category/${categoryId}`, config),
};
 
  export default api