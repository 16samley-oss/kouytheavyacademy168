// src/services/courseService.js
import api from './api';

const API_PREFIX = '/api/v1';

// ============ PUBLIC/USER ENDPOINTS (with /api/v1 prefix) ============

/**
 * Get all published courses - PUBLIC
 * GET /api/v1/courses/
 */
export const getPublishedCourses = (params = {}) => {
  return api.get(`${API_PREFIX}/courses/`, { params }).then(res => res.data);
};

/**
 * Get a single course by ID - PUBLIC
 * GET /api/v1/courses/{id}
 */
export const getCourseById = (id) => {
  return api.get(`${API_PREFIX}/courses/${id}`).then(res => res.data);
};

/**
 * Get lessons for a course - Requires enrollment
 * GET /api/v1/courses/{courseId}/lessons
 */
export const getCourseLessons = (courseId) => {
  return api.get(`${API_PREFIX}/courses/${courseId}/lessons`).then(res => res.data);
};

/**
 * Get a specific lesson - Requires enrollment
 * GET /api/v1/courses/{courseId}/lessons/{lessonId}
 */
export const getLessonById = (courseId, lessonId) => {
  return api.get(`${API_PREFIX}/courses/${courseId}/lessons/${lessonId}`).then(res => res.data);
};

/**
 * Enroll in a course - Requires authentication
 * POST /api/v1/courses/{courseId}/enroll
 */
export const enrollInCourse = (courseId) => {
  return api.post(`${API_PREFIX}/courses/${courseId}/enroll`).then(res => res.data);
};

/**
 * Mark a lesson as complete - Requires enrollment
 * POST /api/v1/courses/{courseId}/lessons/{lessonId}/complete
 */
export const markLessonComplete = (courseId, lessonId) => {
  return api.post(`${API_PREFIX}/courses/${courseId}/lessons/${lessonId}/complete`).then(res => res.data);
};

/**
 * Get course progress - Requires enrollment
 * GET /api/v1/courses/{courseId}/progress
 */
export const getCourseProgress = (courseId) => {
  return api.get(`${API_PREFIX}/courses/${courseId}/progress`).then(res => res.data);
};

/**
 * Check enrollment status - Requires authentication
 * GET /api/v1/courses/{courseId}/enrollment-status
 */
export const checkEnrollmentStatus = (courseId) => {
  return api.get(`${API_PREFIX}/courses/${courseId}/enrollment-status`).then(res => res.data);
};

/**
 * Get enrolled courses - Requires authentication
 * GET /api/v1/courses/enrolled
 */
export const getEnrolledCourses = () => {
  return api.get(`${API_PREFIX}/courses/enrolled`).then(res => res.data);
};

// ============ ADMIN ENDPOINTS (no /api/v1 prefix) ============

/**
 * Get all courses (including unpublished) - ADMIN ONLY
 * GET /admin/courses/all
 */
export const getAllCoursesAdmin = (params = {}) => {
  return api.get('/admin/courses/all', { params }).then(res => res.data);
};

/**
 * Create a new course - ADMIN ONLY
 * POST /admin/courses
 */
export const createCourseAdmin = (courseData) => {
  return api.post('/admin/courses', courseData).then(res => res.data);
};

/**
 * Update a course - ADMIN ONLY
 * PUT /admin/courses/{id}
 */
export const updateCourseAdmin = (id, courseData) => {
  return api.put(`/admin/courses/${id}`, courseData).then(res => res.data);
};

/**
 * Delete a course - ADMIN ONLY
 * DELETE /admin/courses/{id}
 */
export const deleteCourseAdmin = (id) => {
  return api.delete(`/admin/courses/${id}`).then(res => res.data);
};

/**
 * Toggle course publish status - ADMIN ONLY
 * POST /admin/courses/{id}/publish
 */
export const toggleCoursePublishAdmin = (id) => {
  return api.post(`/admin/courses/${id}/publish`).then(res => res.data);
};

/**
 * Upload course thumbnail - ADMIN ONLY
 * POST /admin/courses/{id}/thumbnail
 */
export const uploadCourseThumbnailAdmin = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/admin/courses/${id}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
};

// ============ LEGACY EXPORTS (for backward compatibility) ============
// These will be removed in a future version

/**
 * @deprecated Use getPublishedCourses() instead
 */
export const getAllCourses = getPublishedCourses;

/**
 * @deprecated Use getCourseById() instead
 */
export const getCourse = getCourseById;

/**
 * @deprecated Use getAllCoursesAdmin() instead
 */
export const getAllCoursesAdminLegacy = getAllCoursesAdmin;

/**
 * @deprecated Use createCourseAdmin() instead
 */
export const createCourse = createCourseAdmin;

/**
 * @deprecated Use updateCourseAdmin() instead
 */
export const updateCourse = updateCourseAdmin;

/**
 * @deprecated Use deleteCourseAdmin() instead
 */
export const deleteCourse = deleteCourseAdmin;

// ============ DEFAULT EXPORT ============

const courseService = {
  // Public/User endpoints
  getPublishedCourses,
  getCourseById,
  getCourseLessons,
  getLessonById,
  enrollInCourse,
  markLessonComplete,
  getCourseProgress,
  checkEnrollmentStatus,
  getEnrolledCourses,
  
  // Admin endpoints
  getAllCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
  toggleCoursePublishAdmin,
  uploadCourseThumbnailAdmin,
  
  // Legacy aliases
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};

export default courseService;