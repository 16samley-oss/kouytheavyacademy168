import api from './api';

export const createLesson = async (lessonData) => {
  try {
    const response = await api.post('/admin/lessons/', lessonData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create lesson');
  }
};

export const getLesson = async (lessonId) => {
  try {
    const response = await api.get(`/admin/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Lesson not found');
  }
};

export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/admin/lessons/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Get course lessons error:', error);
    // Return mock data for development
    return [];
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/admin/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to update lesson');
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/admin/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete lesson');
  }
};

export const toggleLessonPublish = async (lessonId) => {
  try {
    const response = await api.post(`/admin/lessons/${lessonId}/toggle-publish`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to toggle lesson publish status');
  }
};