import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = useCallback(async (apiCall, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(...args);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    callApi,
    clearError: () => setError(null),
  };
};