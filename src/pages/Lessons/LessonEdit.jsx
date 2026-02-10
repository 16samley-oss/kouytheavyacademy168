import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LessonForm from '../../components/Lessons/LessonForm';
import Alert from '../../components/Common/Alert';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getLesson, updateLesson } from '../../services/lessonService';
import { getCourse } from '../../services/courseService';

const LessonEdit = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [courseId, lessonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await getCourse(courseId);
      setCourse(courseData);
      
      // Fetch lesson details
      const lessonData = await getLesson(lessonId);
      setLesson(lessonData);
    } catch (error) {
      setError('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (lessonData) => {
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateLesson(lessonId, lessonData);
      setSuccess('Lesson updated successfully!');
      setLesson({ ...lesson, ...lessonData });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/courses/${courseId}/lessons`);
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to update lesson');
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

  if (!lesson || !course) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800">Lesson Not Found</h2>
          <p className="text-gray-600 mt-2">The lesson you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Lessons
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
            <h1 className="text-2xl font-bold text-gray-800">Edit Lesson</h1>
            <p className="text-gray-600">Update lesson in: {course.title}</p>
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

        {/* Course and lesson info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{lesson.title}</h2>
                <p className="text-gray-600 text-sm">
                  Course: {course.title} • Lesson ID: {lesson.id} • Created: {new Date(lesson.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    lesson.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {lesson.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="text-sm text-gray-500">
                  Order: {lesson.order}
                </span>
              </div>
            </div>
          </div>

          {/* Lesson form */}
          <LessonForm
            initialData={lesson}
            onSubmit={handleSubmit}
            loading={updating}
            courseId={parseInt(courseId)}
          />
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-red-700">Delete this lesson</p>
              <p className="text-sm text-red-600 mt-1">
                Once you delete a lesson, there is no going back. Please be certain.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
                  // Handle delete - you'll need to implement this
                  console.log('Delete lesson:', lessonId);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Lesson
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LessonEdit;