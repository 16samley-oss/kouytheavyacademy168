// src/services/promoCodeService.js
import api from './api';

const API_PREFIX = '/promo-codes';

/**
 * Get all promo codes - ADMIN ONLY
 * GET /promo-codes/
 */
export const getPromoCodes = async (params = {}) => {
  try {
    const response = await api.get(API_PREFIX, { params });
    return response.data;
  } catch (error) {
    console.error('Get promo codes error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch promo codes');
  }
};

/**
 * Get a single promo code by ID - ADMIN ONLY
 * GET /promo-codes/{id}
 */
export const getPromoCodeById = async (id) => {
  try {
    const response = await api.get(`${API_PREFIX}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get promo code error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch promo code');
  }
};

/**
 * Create a new promo code - ADMIN ONLY
 * POST /promo-codes/
 */
export const createPromoCode = async (promoData) => {
  try {
    const response = await api.post(API_PREFIX, promoData);
    return response.data;
  } catch (error) {
    console.error('Create promo code error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create promo code');
  }
};

/**
 * Update a promo code - ADMIN ONLY
 * PUT /promo-codes/{id}
 */
export const updatePromoCode = async (id, promoData) => {
  try {
    const response = await api.put(`${API_PREFIX}/${id}`, promoData);
    return response.data;
  } catch (error) {
    console.error('Update promo code error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update promo code');
  }
};

/**
 * Delete a promo code - ADMIN ONLY
 * DELETE /promo-codes/{id}
 */
export const deletePromoCode = async (id) => {
  try {
    const response = await api.delete(`${API_PREFIX}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete promo code error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete promo code');
  }
};

/**
 * Get promo code usage statistics - ADMIN ONLY
 * GET /promo-codes/{id}/stats
 */
export const getPromoCodeStats = async (id) => {
  try {
    const response = await api.get(`${API_PREFIX}/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error('Get promo code stats error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch promo code stats');
  }
};

/**
 * Get all promo codes usage statistics - ADMIN ONLY
 * GET /promo-codes/stats/overview
 */
export const getPromoCodesOverview = async () => {
  try {
    const response = await api.get(`${API_PREFIX}/stats/overview`);
    return response.data;
  } catch (error) {
    console.error('Get promo codes overview error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch promo codes overview');
  }
};

/**
 * Validate a promo code - USER/ADMIN
 * POST /payments/validate-promo
 */
export const validatePromoCode = async (code, courseIds, userId = null) => {
  try {
    const response = await api.post('/payments/validate-promo', {
      code,
      course_ids: courseIds,
      user_id: userId
    });
    return response.data;
  } catch (error) {
    console.error('Validate promo code error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to validate promo code');
  }
};

/**
 * Get promo code usage history - ADMIN ONLY
 * GET /promo-codes/{id}/usage
 */
export const getPromoCodeUsage = async (id, params = {}) => {
  try {
    const response = await api.get(`${API_PREFIX}/${id}/usage`, { params });
    return response.data;
  } catch (error) {
    console.error('Get promo code usage error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch promo code usage');
  }
};

/**
 * Get user promo code usage - USER/ADMIN
 * GET /promo-codes/user/{userId}/usage
 */
export const getUserPromoUsage = async (userId, params = {}) => {
  try {
    const response = await api.get(`/promo-codes/user/${userId}/usage`, { params });
    return response.data;
  } catch (error) {
    console.error('Get user promo usage error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch user promo usage');
  }
};

const promoCodeService = {
  getPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  getPromoCodeStats,
  getPromoCodesOverview,
  validatePromoCode,
  getPromoCodeUsage,
  getUserPromoUsage
};

export default promoCodeService;