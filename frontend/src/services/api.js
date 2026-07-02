import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

export const driverAPI = {
  search: (params) => api.get('/drivers/search', { params }),
  getProfile: (userId) => api.get(`/drivers/profile/${userId}`),
  updateProfile: (profileData) => api.put('/drivers/profile', profileData),
};

export const tripAPI = {
  calculateFare: (details) => api.post('/trips/fare', details),
  createRequest: (requestData) => api.post('/trips/request', requestData),
  getDriverRequests: () => api.get('/trips/driver/requests'),
  respondToRequest: (requestId, responseData) => api.put(`/trips/request/${requestId}/respond`, responseData),
  updateStatus: (tripId, statusData) => api.put(`/trips/${tripId}/status`, statusData),
  getHistory: () => api.get('/trips/history'),
  reportUnsafe: (tripId, data) => api.put(`/trips/${tripId}/report-unsafe`, data),
};

export const reviewAPI = {
  submitReview: (reviewData) => api.post('/reviews', reviewData),
};

export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getDrivers: (params) => api.get('/admin/drivers', { params }),
  verifyDriver: (driverId, verifyData) => api.put(`/admin/drivers/${driverId}/verify`, verifyData),
  getCustomers: () => api.get('/admin/customers'),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getTrips: () => api.get('/admin/trips'),
  getReviews: () => api.get('/admin/reviews'),
  getComplaints: () => api.get('/admin/complaints'),
};

export default api;
