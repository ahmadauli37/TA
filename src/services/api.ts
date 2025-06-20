import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://residence-api-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current token:', token); // Debug log

    if (token) {
      // Ensure headers object exists
      config.headers = config.headers || {};
      
      // Set Authorization header with Bearer token
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Log the final headers for debugging
      console.log('Request headers:', config.headers);
    } else {
      console.warn('No token found in localStorage');
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // Skip logging for login-related errors
    if (error.config?.url?.includes('/login')) {
      return Promise.reject(error);
    }

    // Suppress logging for 400 errors on /check-username
    if (error.config?.url?.includes('/check-username') && error.response?.status === 400) {
      return Promise.reject(error);
    }

    // Log error details for non-login errors
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    // Only redirect to login if it's not a login request
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      console.log('Unauthorized access, redirecting to login...');
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/login', { email, password }),
  
  register: (userData: {
    email: string;
    password: string;
    username: string;
    phone?: string;
    cluster?: string;
    nomor_rumah?: string;
    rt?: string;
    rw?: string;
  }) => api.post('/auth/register', userData),

  // Add changePassword endpoint
  changePassword: (token: string, newPassword: string) =>
    api.post('/change-password', { token, newPassword }),

  // Add forgotPassword endpoint
  forgotPassword: (email: string) =>
    api.post('/reset-password', { email }),
};

// Family Data API endpoints
export const familyAPI = {
  getFamilyData: (userId: string) => 
    api.get(`/user/${userId}/penghuni`),
  
  createFamilyData: (userId: string, data: {
    nama: string;
    nik: string;
    gender: 'Laki-laki' | 'Perempuan';
  }) => api.post(`/user/${userId}/penghuni`, data),
  
  updateFamilyData: (userId: string, id: string, data: {
    nama?: string;
    nik?: string;
    gender?: 'Laki-laki' | 'Perempuan';
  }) => api.put(`/user/${userId}/penghuni/${id}`, data),
  
  deleteFamilyData: (userId: string, id: string) => 
    api.delete(`/user/${userId}/penghuni/${id}`),
};

// Pengaduan API endpoints
export const pengaduanAPI = {
  getPengaduan: (userId: string) => 
    api.get(`/user/${userId}/pengaduan`),
  
  createPengaduan: (userId: string, formData: FormData) => 
    api.post(`/user/${userId}/pengaduan`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updatePengaduan: (userId: string, id: string, formData: FormData) => 
    api.put(`/user/${userId}/pengaduan/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deletePengaduan: (userId: string, id: string) => 
    api.delete(`/user/${userId}/pengaduan/${id}`),
};

// Broadcast API endpoints
export const broadcastAPI = {
  getAllBroadcast: () => 
    api.get('/user/broadcast'),
  
  getAdminBroadcast: () => 
    api.get('/user/broadcast/admin'),
  
  getUserBroadcast: (userId: string) => 
    api.get(`/user/${userId}/broadcast`),
  
  createBroadcast: (userId: string, formData: FormData) => 
    api.post(`/user/${userId}/broadcast`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateBroadcast: (userId: string, id: string, formData: FormData) => 
    api.put(`/user/${userId}/broadcast/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deleteBroadcast: (userId: string, id: string) => 
    api.delete(`/user/${userId}/broadcast/${id}`),
};

// Emergency API endpoints
export const emergencyAPI = {
  createEmergency: (userId: string, data: {
    jenis: string;
    lokasi: string;
    deskripsi: string;
  }) => api.post(`/user/${userId}/emergency`, data),
  
  getEmergency: () => 
    api.get('/user/emergency'),
};

// Payment API endpoints
export const paymentAPI = {
  getPaymentToken: (data: {
    id: string;
  }) => api.post('/user/payment/tokenizer', data),
  
  checkTransactionStatus: (orderId: string) => 
    api.get(`/user/payment/check-status/${orderId}`),
  
  handlePaymentNotification: (data: any) => 
    api.post('/user/payment/notification', data),
};

// Tagihan API endpoints
export const tagihanAPI = {
  getTagihan: (userId: string) => 
    api.get(`/user/${userId}/tagihan`),
  
  getRiwayatTagihan: (userId: string) => 
    api.get(`/user/${userId}/riwayat`),
};

// Peraturan API endpoints
export const peraturanAPI = {
  getPeraturan: () => 
    api.get('/user/peraturan'),
};

// Surat API endpoints
export const suratAPI = {
  getSurat: (userId: string) => 
    api.get(`/user/${userId}/surat`),
  
  createSurat: (userId: string, data: {
    fasilitas: string;
    keperluan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    deskripsi: string;
  }) => api.post(`/user/${userId}/surat`, data),
  
  deleteSurat: (userId: string, id: string) => 
    api.delete(`/user/${userId}/surat/${id}`),
  
  downloadSurat: (id: string) => 
    api.get(`/user/surat/${id}/download`, {
      responseType: 'blob',
    }),
  
  getSuratUrl: (id: string) => 
    api.get(`/user/surat/${id}/url`),
};

// Notification API endpoints
export const notificationAPI = {
  createFCM: (data: { 
    token: string;
    deviceId: string;
  }) => api.post('/user/fcm', data),
};

// User Profile API endpoints
export const profileAPI = {
  getProfile: () => 
    api.get('/user/profile'),
  
  updateProfile: (userId: string, data: {
    username?: string;
    phone?: string;
    cluster?: string;
    nomor_rumah?: string;
    rt?: string;
    rw?: string;
    password?: string;
  }) => api.put(`/user/profile/${userId}`, data),

  // Add checkUsername endpoint
  checkUsername: (username: string) =>
    api.post('/check-username', { username }),
};

export default api;