// services/paymentService.js - COMPLETE FIXED VERSION
import api from './api';

// Regular user endpoints (with /api/v1 prefix)
export const getPayments = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/payments', { params });
    return response.data;
  } catch (error) {
    console.error('Get payments error:', error);
    throw error;
  }
};

export const getPayment = async (paymentId) => {
  try {
    const response = await api.get(`/api/v1/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Get payment error:', error);
    throw error;
  }
};

export const createKHQRPayment = async (courseId, amount, currency = 'USD') => {
  try {
    const response = await api.post('/api/v1/payments/khqr', {
      course_id: courseId,
      amount: amount,
      currency: currency
    });
    return response.data;
  } catch (error) {
    console.error('Create KHQR payment error:', error);
    throw error;
  }
};

export const verifyPayment = async (md5_hash) => {
  try {
    const response = await api.post('/api/v1/payments/verify', { md5_hash });
    return response.data;
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

// Admin endpoints (at root level: /admin/...)
export const getAllPayments = async (params = {}) => {
  try {
    // CHANGED FROM '/payments/admin/all' to '/admin/payments/all'
    const response = await api.get('/admin/payments/all', { params });
    return response.data;
  } catch (error) {
    console.error('Get all payments error:', error);
    throw error;
  }
};

export const verifyBulkPayments = async (md5_hashes) => {
  try {
    // This should still be in /api/v1/payments router
    const response = await api.post('/api/v1/payments/bulk-verify', { md5_hashes });
    return response.data;
  } catch (error) {
    console.error('Bulk verify payments error:', error);
    throw error;
  }
};

export const exportPayments = async (format = 'csv') => {
  try {
    // Use the admin endpoint for exports
    const response = await api.get('/admin/payments/export', {
      params: { format },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `payments_export_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, filename };
  } catch (error) {
    console.error('Export payments error:', error);
    throw error;
  }
};

// QR Code endpoint
export const getQRImage = async (md5_hash) => {
  try {
    const response = await api.get(`/api/v1/payments/qr/${md5_hash}`);
    return response.data;
  } catch (error) {
    console.error('Get QR image error:', error);
    return null;
  }
};

// Mock data for development/testing
export const getMockPayments = () => {
  return [
    {
      id: 1,
      transaction_id: 'ELRN-20240115-ABC123',
      user_id: 1,
      user: {
        id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        username: 'johndoe'
      },
      course_id: 1,
      course: {
        id: 1,
        title: 'Web Development Bootcamp',
        price: 99.99
      },
      amount: 99.99,
      currency: 'USD',
      status: 'paid',
      payment_method: 'bakong',
      khqr_md5: 'abc123def456',
      created_at: '2024-01-15T10:30:00Z',
      paid_at: '2024-01-15T10:35:00Z'
    },
    {
      id: 2,
      transaction_id: 'ELRN-20240115-XYZ789',
      user_id: 2,
      user: {
        id: 2,
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        username: 'janesmith'
      },
      course_id: 2,
      course: {
        id: 2,
        title: 'Data Science Fundamentals',
        price: 149.99
      },
      amount: 149.99,
      currency: 'USD',
      status: 'pending',
      payment_method: 'bakong',
      khqr_md5: 'xyz789uvw456',
      created_at: '2024-01-15T11:30:00Z',
      paid_at: null
    },
    {
      id: 3,
      transaction_id: 'ELRN-20240114-DEF456',
      user_id: 3,
      user: {
        id: 3,
        full_name: 'Bob Johnson',
        email: 'bob@example.com',
        username: 'bobjohnson'
      },
      course_id: 3,
      course: {
        id: 3,
        title: 'Mobile App Development',
        price: 79.99
      },
      amount: 79.99,
      currency: 'USD',
      status: 'failed',
      payment_method: 'bakong',
      khqr_md5: 'def456ghi789',
      created_at: '2024-01-14T09:15:00Z',
      paid_at: null
    }
  ];
};

// Check if backend is available
export const checkPaymentsHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    return false;
  }
};

// Additional helper function to test the new endpoint
export const testAdminPaymentsEndpoint = async () => {
  try {
    const response = await api.get('/admin/payments/all', { params: { limit: 5 } });
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error('Test endpoint error:', error.response?.status, error.message);
    return {
      success: false,
      status: error.response?.status,
      message: error.message
    };
  }
};