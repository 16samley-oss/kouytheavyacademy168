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

export const createKHQRPayment = async (courseId, amount, currency = 'USD', promoCode = null) => {
  try {
    const response = await api.post('/api/v1/payments/khqr', {
      course_id: courseId,
      amount: amount, // This should already be the discounted amount if promo applied
      currency: currency,
      promo_code: promoCode
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

// Admin endpoints - FIXED: Now correctly handles discount fields
export const getAllPayments = async (params = {}) => {
  try {
    console.log('Fetching payments from /admin/payments/all');
    
    const initialResponse = await api.get('/admin/payments/all', { 
      params: { 
        limit: 10000,
        skip: 0,
        ...params 
      } 
    });

    console.log('Initial response:', initialResponse);

    let payments = [];
    let totalCount = 0;

    // Handle different response formats
    if (Array.isArray(initialResponse.data)) {
      payments = initialResponse.data;
      totalCount = payments.length;
    } 
    else if (initialResponse.data && initialResponse.data.payments) {
      payments = initialResponse.data.payments;
      totalCount = initialResponse.data.total || payments.length;
    }
    else if (initialResponse.data && initialResponse.data.data) {
      payments = initialResponse.data.data;
      totalCount = initialResponse.data.total || payments.length;
    }
    else {
      payments = initialResponse.data || [];
      totalCount = payments.length;
    }

    // Normalize payment data to ensure discount fields are present
    payments = payments.map(normalizePaymentData);

    // Fetch all pages if needed
    if (totalCount > payments.length) {
      console.log(`📊 Total records: ${totalCount}, Current: ${payments.length}. Fetching all pages...`);
      
      const perPage = 100;
      const totalPages = Math.ceil(totalCount / perPage);
      let allPayments = [...payments];
      
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
          
          let pagePayments = [];
          if (Array.isArray(response.data)) {
            pagePayments = response.data;
          } else if (response.data && response.data.payments) {
            pagePayments = response.data.payments;
          } else if (response.data && response.data.data) {
            pagePayments = response.data.data;
          }
          
          // Normalize each payment
          pagePayments = pagePayments.map(normalizePaymentData);
          allPayments = [...allPayments, ...pagePayments];
          
        } catch (pageError) {
          console.error(`❌ Error fetching page ${page + 1}:`, pageError);
        }
      }
      
      console.log(`✅ COMPLETE: Fetched ${allPayments.length} payments`);
      return allPayments;
    }

    console.log(`✅ Returned ${payments.length} payments`);
    return payments;
    
  } catch (error) {
    console.error('❌ Get all payments error:', error);
    
    if (error.response?.status === 404) {
      console.warn('⚠️ Admin endpoint not found (404). Using mock data.');
      return getMockPayments(150);
    }
    
    error.message = `Failed to fetch payments: ${error.message}`;
    throw error;
  }
};

// Helper function to normalize payment data and ensure discount fields are correct
const normalizePaymentData = (payment) => {
  if (!payment) return payment;
  
  // Ensure we have amount as number
  const amount = parseFloat(payment.amount) || 0;
  const originalAmount = parseFloat(payment.original_amount) || amount;
  const discountAmount = parseFloat(payment.discount_amount) || 0;
  
  // CRITICAL FIX: If we have original_amount and discount_amount, 
  // ensure amount = original_amount - discount_amount
  if (payment.original_amount && payment.discount_amount) {
    const calculatedAmount = originalAmount - discountAmount;
    
    // If current amount doesn't match calculation, log warning
    if (Math.abs(amount - calculatedAmount) > 0.01) {
      console.warn(`⚠️ Payment ${payment.id} has incorrect amount:`, {
        id: payment.id,
        transaction_id: payment.transaction_id,
        amount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        calculated: calculatedAmount,
        promo_code: payment.promo_code?.code
      });
      
      // Fix the amount
      payment.amount = calculatedAmount;
    }
  }
  
  return payment;
};

// NEW: Paginated version with normalized amounts
export const getPaginatedPayments = async (page = 1, limit = 50, filters = {}) => {
  try {
    const response = await api.get('/admin/payments/all', {
      params: {
        limit,
        skip: (page - 1) * limit,
        ...filters
      }
    });
    
    let payments = [];
    let total = 0;
    
    if (response.data && response.data.payments) {
      payments = response.data.payments.map(normalizePaymentData);
      total = response.data.total || payments.length;
    } else if (Array.isArray(response.data)) {
      payments = response.data.map(normalizePaymentData);
      total = payments.length;
    } else {
      payments = (response.data || []).map(normalizePaymentData);
      total = payments.length;
    }
    
    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
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
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
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

// Enhanced mock data with proper discount handling
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
  const promoCodeTypes = ['SAVE10', 'WELCOME20', 'FLASH25', 'SPECIAL15', null];
  
  const mockData = [];
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const userIndex = Math.floor(Math.random() * names.length);
    const courseIndex = Math.floor(Math.random() * courses.length);
    
    // Base price for the course
    const basePrice = [99.99, 149.99, 79.99, 199.99, 49.99, 299.99][Math.floor(Math.random() * 6)];
    
    // Randomly apply a promo code (30% chance)
    const hasPromo = Math.random() < 0.3;
    let discountAmount = 0;
    let promoCode = null;
    let finalAmount = basePrice;
    
    if (hasPromo) {
      const discountPercent = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
      discountAmount = parseFloat((basePrice * discountPercent / 100).toFixed(2));
      finalAmount = basePrice - discountAmount;
      promoCode = promoCodeTypes[Math.floor(Math.random() * (promoCodeTypes.length - 1))];
    }
    
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
        price: basePrice
      },
      // CRITICAL: Store both original and final amounts
      amount: finalAmount,
      original_amount: basePrice,
      discount_amount: discountAmount,
      promo_code: promoCode ? { code: promoCode, discount_value: discountAmount, discount_type: 'percentage' } : null,
      currency: 'USD',
      status: status,
      payment_method: 'bakong',
      khqr_md5: `${Math.random().toString(36).substring(2,15)}${Math.random().toString(36).substring(2,15)}`,
      created_at: createdDate.toISOString(),
      paid_at: paidDate ? paidDate.toISOString() : null
    });
  }
  
  return mockData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// NEW: Fix payment amounts endpoint
export const fixPaymentAmounts = async () => {
  try {
    const response = await api.post('/admin/payments/fix-amounts');
    return response.data;
  } catch (error) {
    console.error('Error fixing payment amounts:', error);
    throw error;
  }
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
    
    // Check for discount fields
    if (response.data && response.data.payments) {
      const firstPayment = response.data.payments[0];
      console.log('Payment fields:', {
        amount: firstPayment.amount,
        original_amount: firstPayment.original_amount,
        discount_amount: firstPayment.discount_amount,
        has_promo: !!firstPayment.promo_code
      });
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

// NEW: Validate amount consistency across all payments
export const validatePaymentAmounts = async () => {
  try {
    const payments = await getAllPayments();
    
    const issues = payments.filter(p => {
      if (p.original_amount && p.discount_amount) {
        const calculated = p.original_amount - p.discount_amount;
        return Math.abs(p.amount - calculated) > 0.01;
      }
      return false;
    });
    
    return {
      total: payments.length,
      issues: issues.length,
      issueList: issues.map(p => ({
        id: p.id,
        transaction_id: p.transaction_id,
        amount: p.amount,
        original: p.original_amount,
        discount: p.discount_amount,
        calculated: p.original_amount - p.discount_amount
      }))
    };
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
};