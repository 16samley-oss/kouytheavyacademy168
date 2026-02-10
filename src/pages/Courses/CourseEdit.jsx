import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import CourseForm from '../../components/Courses/CourseForm';
import Alert from '../../components/Common/Alert';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getCourse, updateCourse } from '../../services/courseService';

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await getCourse(id);
      setCourse(data);
    } catch (err) {
      setError('Failed to load course');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (courseData) => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateCourse(id, courseData);
      setSuccess('Course updated successfully!');
      setCourse({ ...course, ...courseData });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update course');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800">Course Not Found</h2>
          <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
            <p className="text-gray-600">Update course information</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Courses
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} />
        )}

        {/* Course info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-lg font-semibold">{course.title}</h2>
            <p className="text-gray-600 text-sm mt-1">
              Created on {new Date(course.created_at).toLocaleDateString()}
            </p>
          </div>

          <CourseForm
            initialData={course}
            onSubmit={handleSubmit}
            loading={updating}
          />
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-red-700">Delete this course</p>
              <p className="text-sm text-red-600 mt-1">
                Once you delete a course, there is no going back. Please be certain.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                  // Handle delete
                  console.log('Delete course:', id);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseEdit;