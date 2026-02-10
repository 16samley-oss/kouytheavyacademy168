import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LessonForm from '../../components/Lessons/LessonForm';
import Alert from '../../components/Common/Alert';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { createLesson } from '../../services/lessonService';
import { getCourse } from '../../services/courseService';

const LessonCreate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      setError('Failed to load course');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (lessonData) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await createLesson(lessonData);
      setSuccess('Lesson created successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/courses/${courseId}/lessons`);
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to create lesson');
    } finally {
      setSubmitting(false);
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
            <h1 className="text-2xl font-bold text-gray-800">Create New Lesson</h1>
            <p className="text-gray-600">Add a new lesson to: {course.title}</p>
          </div>
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Lessons
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
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-blue-600"></i>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{course.title}</h2>
                <p className="text-gray-600 text-sm">
                  Course ID: {course.id} • {course.course_type === 'free' ? 'Free' : `$${course.price}`}
                </p>
              </div>
            </div>
          </div>

          {/* Lesson form */}
          <LessonForm
            onSubmit={handleSubmit}
            loading={submitting}
            courseId={parseInt(courseId)}
          />
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-lightbulb text-blue-400"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for creating effective lessons</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Start with clear learning objectives</li>
                  <li>Keep video lessons under 15 minutes for better engagement</li>
                  <li>Use the order field to sequence lessons logically</li>
                  <li>Provide downloadable resources in the content section</li>
                  <li>Preview lessons before publishing to ensure quality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LessonCreate;