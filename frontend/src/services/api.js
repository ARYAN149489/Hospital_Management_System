// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

// Token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/auth/refresh-token`,
          { refreshToken }
        );
        if (res.data.success) {
          const { accessToken } = res.data.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (creds) => api.post('/auth/login', creds, {
    validateStatus: s => s >= 200 && s < 500
  }).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  getProfile: () => api.get('/auth/profile').then(r => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then(r => r.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(r => r.data),
};

// ===== PATIENT =====
export const patientAPI = {
  getDashboard: () => api.get('/patients/dashboard', {
    params: { _t: Date.now() }
  }).then(r => r.data),
  getProfile: () => api.get('/patients/profile').then(r => r.data),
  updateProfile: (data) => api.put('/patients/profile', data).then(r => r.data),
  getMedicalRecords: () => api.get('/patients/medical-records').then(r => r.data),
  getPrescriptions: () => api.get('/patients/prescriptions').then(r => r.data),
  getLabTests: () => api.get('/patients/lab-tests').then(r => r.data),
  bookLabTest: (data) => api.post('/patients/lab-tests/book', data).then(r => r.data),
  uploadDocument: (formData) => api.post('/patients/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
};

// ===== DOCTOR =====
export const doctorAPI = {
  getAll: (filters) => api.get('/doctors', { params: filters }).then(r => r.data),
  getById: (id) => api.get(`/doctors/${id}`).then(r => r.data),
  getProfile: () => api.get('/doctor/profile').then(r => r.data),
  updateProfile: (data) => api.put('/doctor/profile', data).then(r => r.data),
  getSchedule: () => api.get('/doctor/schedule').then(r => r.data),
  updateSchedule: (data) => api.put('/doctor/schedule', data).then(r => r.data),
  getAppointments: (filters) => api.get('/doctor/appointments', { params: filters }).then(r => r.data),
  updateAppointmentStatus: (id, data) => api.patch(`/doctor/appointments/${id}/status`, data).then(r => r.data),
  applyLeave: (data) => api.post('/leaves', data).then(r => r.data),
  getLeaves: () => api.get('/leaves/my-leaves').then(r => r.data),
  cancelLeave: (id) => api.delete(`/leaves/${id}`).then(r => r.data),
  getDashboard: () => api.get('/doctor/dashboard').then(r => r.data),
  createPrescription: (data) => api.post('/doctor/prescriptions', data).then(r => r.data),
  getPrescriptions: () => api.get('/doctor/prescriptions').then(r => r.data),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`).then(r => r.data),
  getPatients: () => api.get('/doctor/patients').then(r => r.data),
  getPatientHistory: (patientId) => api.get(`/doctor/patients/${patientId}/history`).then(r => r.data),
};

// ===== APPOINTMENTS =====
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data).then(r => r.data),
  getById: (id) => api.get(`/appointments/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/appointments/${id}`, data).then(r => r.data),
  cancel: (id, reason) => api.patch(`/appointments/${id}/cancel`, { cancelReason: reason }).then(r => r.data),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available-slots/${doctorId}`, { params: { date } }).then(r => r.data),
  getMyAppointments: (filters) => api.get('/appointments/my-appointments', { params: filters }).then(r => r.data),
  reschedule: (id, data) => api.patch(`/appointments/${id}/reschedule`, data).then(r => r.data),
};

// ===== ADMIN =====
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/stats').then(r => r.data),
  getAllUsers: (filters) => api.get('/admin/users', { params: filters }).then(r => r.data),
  getUserById: (id) => api.get(`/admin/users/${id}`).then(r => r.data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
  toggleUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }).then(r => r.data),
  getPendingDoctors: () => api.get('/admin/doctors', { params: { status: 'pending' } }).then(r => r.data),
  approveDoctor: (id) => api.patch(`/admin/doctors/${id}/approval`, { status: 'active' }).then(r => r.data),
  rejectDoctor: (id, reason) => api.patch(`/admin/doctors/${id}/approval`, { status: 'rejected', rejectionReason: reason }).then(r => r.data),
  getPendingLeaves: () => api.get('/admin/leaves', { params: { status: 'pending' } }).then(r => r.data),
  getAllLeaves: (filters) => api.get('/admin/leaves', { params: filters }).then(r => r.data),
  approveLeave: (id) => api.patch(`/admin/leaves/${id}/approval`, { status: 'approved' }).then(r => r.data),
  rejectLeave: (id, reason) => api.patch(`/admin/leaves/${id}/approval`, { status: 'rejected', rejectionReason: reason }).then(r => r.data),
  getDepartments: () => api.get('/admin/departments').then(r => r.data),
  createDepartment: (data) => api.post('/admin/departments', data).then(r => r.data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data).then(r => r.data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`).then(r => r.data),
  getAllLabTests: (filters) => api.get('/admin/lab-tests', { params: filters }).then(r => r.data),
  updateLabTestResult: (id, data) => api.patch(`/admin/lab-tests/${id}/result`, data).then(r => r.data),
  updateLabTestStatus: (id, data) => api.patch(`/admin/lab-tests/${id}/status`, data).then(r => r.data),
  getAllAppointments: (filters) => api.get('/admin/appointments', { params: filters }).then(r => r.data),
  getAnalytics: () => api.get('/admin/analytics').then(r => r.data),
  createDoctor: (data) => api.post('/admin/doctors/create', data).then(r => r.data),
  getAllDoctors: (filters) => api.get('/admin/doctors', { params: filters }).then(r => r.data),
  getAllPatients: (filters) => api.get('/admin/patients', { params: filters }).then(r => r.data),
  getPatientDetails: (id) => api.get(`/admin/patients/${id}`).then(r => r.data),
};

// ===== NOTIFICATIONS =====
export const notificationAPI = {
  getAll: (filters) => api.get('/notifications', { params: filters }).then(r => r.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () => api.patch('/notifications/mark-all-read').then(r => r.data),
  delete: (id) => api.delete(`/notifications/${id}`).then(r => r.data),
  getUnreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
};

// ===== CHATBOT =====
export const chatbotAPI = {
  sendMessage: (data) => api.post('/chatbot/message', data).then(r => r.data),
  getHistory: () => api.get('/chatbot/history').then(r => r.data),
  clearHistory: () => api.delete('/chatbot/history').then(r => r.data),
};

export default api;
