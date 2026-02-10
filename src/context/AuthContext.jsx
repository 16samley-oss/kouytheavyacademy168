import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user:', error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        setToken(response.access_token);
        
        const userData = await getCurrentUser();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, data: userData };
      } else {
        return { 
          success: false, 
          message: 'Invalid response from server' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};