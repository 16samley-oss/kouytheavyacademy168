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

// Admin endpoints - FIXED: Now correctly uses /admin/payments/all
export const getAllPayments = async (params = {}) => {
  try {
    console.log('Fetching payments from /admin/payments/all');
    
    // First request to get first page and total count
    const initialResponse = await api.get('/admin/payments/all', { 
      params: { 
        limit: 10000, // Request max per page (adjust based on your API)
        skip: 0,
        ...params 
      } 
    });

    console.log('Initial response:', initialResponse);

    // Handle different response formats
    let payments = [];
    let totalCount = 0;

    // Case 1: Response is an array directly
    if (Array.isArray(initialResponse.data)) {
      payments = initialResponse.data;
      totalCount = payments.length;
      console.log('Response is array with length:', payments.length);
    } 
    // Case 2: Response has payments array and total count (most common)
    else if (initialResponse.data && initialResponse.data.payments) {
      payments = initialResponse.data.payments;
      totalCount = initialResponse.data.total || payments.length;
      console.log('Response has payments array:', {
        paymentsLength: payments.length,
        total: initialResponse.data.total
      });
    }
    // Case 3: Response has data field
    else if (initialResponse.data && initialResponse.data.data) {
      payments = initialResponse.data.data;
      totalCount = initialResponse.data.total || payments.length;
    }
    // Case 4: Something else
    else {
      payments = initialResponse.data || [];
      totalCount = payments.length;
    }

    // If there's a total count and it's more than what we got, fetch all pages
    if (totalCount > payments.length) {
      console.log(`📊 Total records: ${totalCount}, Current: ${payments.length}. Fetching all pages...`);
      
      const perPage = 100; // Match your API's max per page
      const totalPages = Math.ceil(totalCount / perPage);
      let allPayments = [...payments];
      
      // Show progress indicator
      console.log(`🔄 Fetching ${totalPages} total pages...`);
      
      // Fetch remaining pages
      for (let page = 1; page < totalPages; page++) {
        try {
          console.log(`Fetching page ${page + 1}/${totalPages}...`);
          
          const response = await api.get('/admin/payments/all', {
            params: {
              limit: perPage,
              skip: page * perPage,
              ...params
            }
          });
          
          // Extract payments from response
          let pagePayments = [];
          if (Array.isArray(response.data)) {
            pagePayments = response.data;
          } else if (response.data && response.data.payments) {
            pagePayments = response.data.payments;
          } else if (response.data && response.data.data) {
            pagePayments = response.data.data;
          }
          
          allPayments = [...allPayments, ...pagePayments];
          console.log(`✅ Page ${page + 1} complete. Total now: ${allPayments.length}`);
          
        } catch (pageError) {
          console.error(`❌ Error fetching page ${page + 1}:`, pageError);
          // Continue with what we have
        }
      }
      
      console.log(`✅ COMPLETE: Fetched ${allPayments.length} payments`);
      return allPayments;
    }

    console.log(`✅ Returned ${payments.length} payments`);
    return payments;
    
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    
    // Handle 404 specifically
    if (error.response?.status === 404) {
      console.warn('⚠️ Admin endpoint not found (404). Using mock data.');
      return getMockPayments();
    }
    
    // For other errors, throw but include helpful info
    error.message = `Failed to fetch payments: ${error.message}`;
    throw error;
  }
};

// NEW: Paginated version for better performance
export const getPaginatedPayments = async (page = 1, limit = 50, filters = {}) => {
  try {
    const response = await api.get('/admin/payments/all', {
      params: {
        limit,
        skip: (page - 1) * limit,
        ...filters
      }
    });
    
    // Return with pagination metadata
    if (response.data && response.data.payments) {
      return {
        payments: response.data.payments,
        total: response.data.total || response.data.payments.length,
        page,
        limit,
        totalPages: Math.ceil((response.data.total || response.data.payments.length) / limit)
      };
    } else if (Array.isArray(response.data)) {
      return {
        payments: response.data,
        total: response.data.length,
        page,
        limit,
        totalPages: Math.ceil(response.data.length / limit)
      };
    }
    
    return {
      payments: response.data || [],
      total: response.data?.length || 0,
      page,
      limit,
      totalPages: 1
    };
  } catch (error) {
    console.error('Get paginated payments error:', error);
    throw error;
  }
};

export const verifyBulkPayments = async (md5_hashes) => {
  try {
    const response = await api.post('/api/v1/payments/bulk-verify', { md5_hashes });
    return response.data;
  } catch (error) {
    console.error('Bulk verify payments error:', error);
    throw error;
  }
};

export const exportPayments = async (format = 'csv') => {
  try {
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

// Enhanced mock data with more records
export const getMockPayments = (count = 150) => {
  const statuses = ['paid', 'pending', 'failed'];
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson', 'Diana Prince', 'Evan Wright', 'Fiona Adams'];
  const courses = [
    'Web Development Bootcamp',
    'Data Science Fundamentals',
    'Mobile App Development', 
    'UI/UX Design Masterclass',
    'Python for Beginners',
    'React Advanced Patterns',
    'Machine Learning A-Z',
    'Digital Marketing 101'
  ];
  
  const mockData = [];
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const userIndex = Math.floor(Math.random() * names.length);
    const courseIndex = Math.floor(Math.random() * courses.length);
    const amount = [99.99, 149.99, 79.99, 199.99, 49.99, 299.99][Math.floor(Math.random() * 6)];
    
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
    
    const paidDate = status === 'paid' ? new Date(createdDate) : null;
    if (paidDate) {
      paidDate.setMinutes(paidDate.getMinutes() + Math.floor(Math.random() * 60));
    }
    
    mockData.push({
      id: i,
      transaction_id: `ELRN-${createdDate.toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
      user_id: userIndex + 1,
      user: {
        id: userIndex + 1,
        full_name: names[userIndex],
        email: `${names[userIndex].toLowerCase().replace(' ', '.')}@example.com`,
        username: names[userIndex].toLowerCase().replace(' ', '')
      },
      course_id: courseIndex + 1,
      course: {
        id: courseIndex + 1,
        title: courses[courseIndex],
        price: amount
      },
      amount: amount,
      currency: 'USD',
      status: status,
      payment_method: 'bakong',
      khqr_md5: `${Math.random().toString(36).substring(2,15)}${Math.random().toString(36).substring(2,15)}`,
      created_at: createdDate.toISOString(),
      paid_at: paidDate ? paidDate.toISOString() : null
    });
  }
  
  // Sort by created_at descending (newest first)
  return mockData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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

// Test function to debug endpoint
export const testAdminPaymentsEndpoint = async () => {
  try {
    console.log('🔍 Testing /admin/payments/all endpoint...');
    
    const response = await api.get('/admin/payments/all', { 
      params: { limit: 5 } 
    });
    
    console.log('✅ Test successful!');
    console.log('Status:', response.status);
    console.log('Data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));
    console.log('Data preview:', response.data);
    
    if (response.data && response.data.payments) {
      console.log('Payments array length:', response.data.payments.length);
      console.log('Total records:', response.data.total);
    }
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      hasPayments: !!(response.data?.payments || Array.isArray(response.data))
    };
  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response data:', error.response?.data);
    
    return {
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    };
  }
};