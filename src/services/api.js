import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const login = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/token`, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch user');
  }
};

// Dashboard endpoints
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    // Return mock data if endpoint doesn't exist
    return {
      total_users: 25,
      total_courses: 12,
      total_revenue: 1850.50,
      pending_payments: 3
    };
  }
};

// Course endpoints
export const getAllCourses = async (params = {}) => {
  try {
    const response = await api.get('/admin/courses/all', { params });
    return response.data;
  } catch (error) {
    console.error('Get courses error:', error);
    return [];
  }
};

export const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Course not found');
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/admin/courses', courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create course');
  }
};

export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/admin/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update course');
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete course');
  }
};

// User endpoints
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Get users error:', error);
    return [];
  }
};

export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'User not found');
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update user');
  }
};

export const toggleUserStatus = async (id) => {
  try {
    const response = await api.post(`/admin/users/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to toggle user status');
  }
};

// Payment endpoints
export const getPayments = async (params = {}) => {
  try {
    const response = await api.get('/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Get payments error:', error);
    return [];
  }
};

export const verifyPayment = async (md5_hash) => {
  try {
    const response = await api.post('/payments/verify', { md5_hash });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to verify payment');
  }
};

export const verifyBulkPayments = async (md5_hashes) => {
  try {
    const response = await api.post('/payments/bulk-verify', { md5_hashes });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to verify bulk payments');
  }
};

// Enrollment endpoints
export const getEnrollments = async (params = {}) => {
  try {
    const response = await api.get('/admin/enrollments', { params });
    return response.data;
  } catch (error) {
    console.error('Get enrollments error:', error);
    return [];
  }
};

// ============ BACKUP ENDPOINTS ============

// Get database info
export const getDatabaseInfo = async () => {
  try {
    const response = await api.get('/admin/backup/info');
    return response.data;
  } catch (error) {
    console.error('Get database info error:', error);
    // Return mock data if endpoint doesn't exist
    return {
      timestamp: new Date().toISOString(),
      tables: {
        users: { count: 25, model: 'User' },
        courses: { count: 12, model: 'Course' },
        enrollments: { count: 18, model: 'Enrollment' },
        payments: { count: 30, model: 'Payment' },
        lessons: { count: 45, model: 'Lesson' },
        lesson_progress: { count: 120, model: 'LessonProgress' }
      }
    };
  }
};

// Download backup
export const downloadBackup = async (format = 'json') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/admin/backup/export/${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    
    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `backup_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    // Get the blob data
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Download backup error:', error);
    throw new Error(error.message || 'Failed to download backup');
  }
};

// Validate backup file
export const validateBackupFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/backup/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Validate backup error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to validate backup file');
  }
};

// Restore from backup
export const restoreBackup = async (file, clearExisting = false) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clear_existing', clearExisting.toString());
    
    const response = await api.post('/admin/backup/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Restore backup error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to restore from backup');
  }
};

// Simple download function for direct URL access (for backwards compatibility)
export const triggerBackupDownload = (format = 'json') => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return false;
  }
  
  const url = `${API_URL}/admin/backup/export/${format}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  
  // Add token to headers by appending it as a query parameter
  // This is a workaround since we can't set headers on anchor clicks
  link.href = `${url}?token=${encodeURIComponent(token)}`;
  
  // Alternative: Use fetch to get the file and then download
  // This is better but requires more code
  const performDownload = async () => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const urlObject = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = urlObject;
      downloadLink.download = `backup_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(urlObject);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}`);
      return false;
    }
  };
  
  return performDownload();
};

// ============ OTHER ENDPOINTS ============

// Health check
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 3000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend not available:', error.message);
    return false;
  }
};

// Simple file upload helper (for thumbnails, etc.)
export const uploadFile = async (endpoint, file, fieldName = 'file') => {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload file error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to upload file');
  }
};

export default api;