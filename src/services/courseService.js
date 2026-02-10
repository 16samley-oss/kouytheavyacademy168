import api from './api';

export const getAllCourses = (params = {}) => {
  return api.get('/admin/courses/all', { params }).then(res => res.data);
};

export const getCourse = (id) => {
  return api.get(`/courses/${id}`).then(res => res.data);
};

export const createCourse = (courseData) => {
  return api.post('/admin/courses', courseData).then(res => res.data);
};

export const updateCourse = (id, courseData) => {
  return api.put(`/admin/courses/${id}`, courseData).then(res => res.data);
};

export const deleteCourse = (id) => {
  return api.delete(`/admin/courses/${id}`).then(res => res.data);
};