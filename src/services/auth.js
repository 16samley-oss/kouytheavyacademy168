import api from './api';

export const login = (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/token', formData);
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  // CHANGE THIS FROM '/auth/me' to '/me'
  return api.get('/me').then(res => res.data);
};