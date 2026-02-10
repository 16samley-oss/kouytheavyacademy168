import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import CourseForm from '../../components/Courses/CourseForm';
import Alert from '../../components/Common/Alert';
import { createCourse } from '../../services/courseService';

const CourseCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (courseData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createCourse(courseData);
      setSuccess('Course created successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/courses');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Course</h1>
            <p className="text-gray-600">Add a new course to your platform</p>
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

        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6">
          <CourseForm onSubmit={handleSubmit} loading={loading} />
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-lightbulb text-blue-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure to provide clear and detailed course descriptions</li>
                  <li>Add engaging thumbnails to increase enrollment</li>
                  <li>For paid courses, set a reasonable price point</li>
                  <li>You can always save as draft and publish later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseCreate;