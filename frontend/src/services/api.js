import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - Redirecting to login');
      localStorage.clear();
      window.location.href = '/customer-login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIS ============
export const authAPI = {
  customerLogin: (data) => api.post('/auth/login', data),
  customerSignup: (data) => api.post('/auth/signup', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  managerLogin: (data) => api.post('/auth/manager/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  getAllUsers: () => api.get('/auth/users'),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ============ PARKING APIS ============
export const parkingAPI = {
  // Vehicle Entry/Exit
  vehicleEntry: (data) => api.post('/parking/park', data),
  vehicleExit: (data) => api.post('/parking/exit', data),
  
  // Slots
  getAvailableSlots: (params) => api.get('/parking/available', { params }),
  getAllSlots: (params) => api.get('/parking/slots', { params }),
  createSlots: (data) => api.post('/parking/slots', data),
  updateSlotPrice: (slotId, data) => api.put(`/parking/slot/${slotId}/price`, data),
  deleteSlot: (slotId) => api.delete(`/parking/slot/${slotId}`),
  
  // History
  getParkingHistory: (params) => api.get('/parking/history', { params }),
  getParkingStats: () => api.get('/parking/stats'),
  getActiveParkings: () => api.get('/parking/active'),
  
  // Vehicle
  getVehicleDetails: (vehicleNumber) => api.get(`/parking/vehicle/${vehicleNumber}`),
};

// ============ PAYMENT APIS ============
export const paymentAPI = {
  getPendingPayments: () => api.get('/payment/pending'),
  processPayment: (data) => api.post('/payment/process', data),
  getPaymentHistory: (params) => api.get('/payment/history', { params }),
  getPaymentById: (id) => api.get(`/payment/${id}`),
  createPayment: (data) => api.post('/payment/create', data),
  getPaymentStats: () => api.get('/payment/stats'),
  deletePayment: (id) => api.delete(`/payment/${id}`),
};

// ============ REPORT APIS ============
export const reportAPI = {
  generateReport: (data) => api.post('/reports/generate', data),
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  getSlotUtilization: () => api.get('/reports/utilization'),
  getCustomerReport: (data) => api.post('/reports/customer', data),
  getDashboardStats: () => api.get('/reports/dashboard'),
};

export default api;