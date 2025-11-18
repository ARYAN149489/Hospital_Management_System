// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh token for login, register, or refresh-token endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh-token');

    // If error is 401 and we haven't retried yet and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/auth/refresh-token`,
          { refreshToken }
        );

        if (response.data.success) {
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData).then(res => res.data),
  login: (credentials) => api.post('/auth/login', credentials, {
    // Tell axios that 403 is a valid response, not an error
    // This prevents the browser from logging it as a failed request
    validateStatus: function (status) {
      return status >= 200 && status < 500; // Accept all 2xx, 3xx, and 4xx as valid
    }
  }).then(res => {
    // Check if it's an error response (4xx)
    if (res.status === 403) {
      // Return the error data as if it was successful
      return res.data;
    }
    // For successful responses, return data as normal
    return res.data;
  }),
  logout: () => api.post('/auth/logout').then(res => res.data),
  getProfile: () => api.get('/auth/profile').then(res => res.data),
  updateProfile: (updates) => api.put('/auth/profile', updates).then(res => res.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(res => res.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then(res => res.data),
  resetPassword: (data) => api.post('/auth/reset-password', data).then(res => res.data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }).then(res => res.data),
};

// ==================== PATIENT API ====================
export const patientAPI = {
  getDashboard: () => api.get('/patients/dashboard', {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    params: {
      _t: Date.now() // Add timestamp to prevent caching
    }
  }).then(res => res.data),
  getProfile: () => api.get('/patients/profile').then(res => res.data),
  updateProfile: (data) => api.put('/patients/profile', data).then(res => res.data),
  uploadDocument: (formData) => api.post('/patients/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  getMedicalRecords: () => api.get('/patients/medical-records').then(res => res.data),
  getPrescriptions: () => api.get('/patients/prescriptions').then(res => res.data),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`).then(res => res.data),
  getLabTests: () => api.get('/patients/lab-tests').then(res => res.data),
  bookLabTest: (data) => api.post('/patients/lab-tests/book', data).then(res => res.data),
};

// ==================== DOCTOR API ====================
export const doctorAPI = {
  getAll: (filters) => api.get('/doctors', { params: filters }).then(res => res.data),
  getById: (id) => api.get(`/doctors/${id}`).then(res => res.data),
  getProfile: () => api.get('/doctor/profile').then(res => res.data),
  updateProfile: (data) => api.put('/doctor/profile', data).then(res => res.data),
  getSchedule: () => api.get('/doctor/schedule').then(res => res.data),
  updateSchedule: (data) => api.put('/doctor/schedule', data).then(res => res.data),
  getAppointments: (filters) => api.get('/doctor/appointments', { params: filters }).then(res => res.data),
  applyLeave: (data) => api.post('/doctor/leave', data).then(res => res.data),
  getLeaves: () => api.get('/doctor/leave').then(res => res.data),
  createPrescription: (data) => api.post('/doctor/prescriptions', data).then(res => res.data),
  getDashboard: () => api.get('/doctor/dashboard').then(res => res.data),
  getDashboardStats: () => api.get('/doctor/dashboard').then(res => res.data),
};

// ==================== APPOINTMENT API ====================
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data).then(res => res.data),
  getById: (id) => api.get(`/appointments/${id}`).then(res => res.data),
  update: (id, data) => api.put(`/appointments/${id}`, data).then(res => res.data),
  cancel: (id, cancelReason) => api.patch(`/appointments/${id}/cancel`, { cancelReason }).then(res => res.data),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available-slots/${doctorId}`, {
    params: { date }
  }).then(res => res.data),
  getMyAppointments: (filters) => api.get('/appointments/my-appointments', { params: filters }).then(res => res.data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data).then(res => res.data),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(res => res.data),
  
  // User Management
  getAllUsers: (filters) => api.get('/admin/users', { params: filters }).then(res => res.data),
  getUserById: (id) => api.get(`/admin/users/${id}`).then(res => res.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then(res => res.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(res => res.data),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`).then(res => res.data),
  
  // Doctor Management
  getPendingDoctors: () => api.get('/admin/doctors/pending').then(res => res.data),
  approveDoctor: (id, data) => api.put(`/admin/doctors/${id}/approve`, data).then(res => res.data),
  rejectDoctor: (id, reason) => api.put(`/admin/doctors/${id}/reject`, { reason }).then(res => res.data),
  
  // Leave Management
  getPendingLeaves: () => api.get('/admin/leave/pending').then(res => res.data),
  approveLeave: (id) => api.put(`/admin/leave/${id}/approve`).then(res => res.data),
  rejectLeave: (id, reason) => api.put(`/admin/leave/${id}/reject`, { reason }).then(res => res.data),
  
  // Department Management
  getDepartments: () => api.get('/admin/departments').then(res => res.data),
  createDepartment: (data) => api.post('/admin/departments', data).then(res => res.data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data).then(res => res.data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`).then(res => res.data),
  
  // Lab Test Management
  getAllLabTests: (filters) => api.get('/admin/lab-tests', { params: filters }).then(res => res.data),
  getLabTestById: (id) => api.get(`/admin/lab-tests/${id}`).then(res => res.data),
  updateLabTestResult: (id, data) => api.patch(`/admin/lab-tests/${id}/result`, data).then(res => res.data),
  updateLabTestStatus: (id, data) => api.patch(`/admin/lab-tests/${id}/status`, data).then(res => res.data),
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  getAll: (filters) => api.get('/notifications', { params: filters }).then(res => res.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => api.patch('/notifications/mark-all-read').then(res => res.data),
  delete: (id) => api.delete(`/notifications/${id}`).then(res => res.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then(res => res.data),
};

// ==================== CHATBOT API ====================
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data).then(res => res.data),
  getHistory: () => api.get('/chatbot/history').then(res => res.data),
  clearHistory: () => api.delete('/chatbot/history').then(res => res.data),
};

// ==================== LAB TEST API ====================
export const labTestAPI = {
  create: (data) => api.post('/lab-tests', data).then(res => res.data),
  getById: (id) => api.get(`/lab-tests/${id}`).then(res => res.data),
  update: (id, data) => api.put(`/lab-tests/${id}`, data).then(res => res.data),
  uploadResult: (id, formData) => api.post(`/lab-tests/${id}/result`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
};

export default api;