import api from './api';

export const getUsers = (params = {}) => {
  return api.get('/admin/users', { params }).then(res => res.data);
};

export const getUser = (id) => {
  return api.get(`/users/${id}`).then(res => res.data);
};

export const updateUser = (id, userData) => {
  return api.put(`/admin/users/${id}`, userData).then(res => res.data);
};

export const toggleUserStatus = (id) => {
  return api.post(`/admin/users/${id}/toggle`).then(res => res.data);
};