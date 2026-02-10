import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LessonTable from '../../components/Lessons/LessonTable';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import { getCourseLessons, deleteLesson, toggleLessonPublish } from '../../services/lessonService';
import { getCourse } from '../../services/courseService';

const LessonList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await getCourse(courseId);
      setCourse(courseData);
      
      // Fetch lessons
      const lessonsData = await getCourseLessons(courseId);
      setLessons(lessonsData);
    } catch (error) {
      setError('Failed to load lessons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lessonId) => {
    navigate(`/courses/${courseId}/lessons/edit/${lessonId}`);
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteLesson(lessonId);
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        setSuccess('Lesson deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete lesson');
        console.error(error);
      }
    }
  };

  const handleTogglePublish = async (lessonId, currentStatus) => {
    try {
      await toggleLessonPublish(lessonId);
      setLessons(lessons.map(lesson => 
        lesson.id === lessonId 
          ? { ...lesson, is_published: !currentStatus }
          : lesson
      ));
      setSuccess(`Lesson ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update lesson status');
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    navigate(`/courses/${courseId}/lessons/create`);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Lessons for: {course?.title || 'Unknown Course'}
            </h1>
            <p className="text-gray-600">Manage lessons for this course</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate(`/courses/edit/${courseId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Course
            </button>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <i className="fas fa-plus"></i>
              <span>Add Lesson</span>
            </button>
          </div>
        </div>

        {/* Course info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Course Type</p>
              <p className="font-medium capitalize">{course?.course_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-medium">
                {course?.course_type === 'free' ? 'Free' : `$${course?.price}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="font-medium">{lessons.length}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Lessons table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Lessons ({lessons.length})</h2>
          </div>
          <LessonTable
            lessons={lessons}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Lessons</p>
            <p className="text-2xl font-bold">{lessons.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold">
              {lessons.filter(l => l.is_published).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">With Videos</p>
            <p className="text-2xl font-bold">
              {lessons.filter(l => l.video_url).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Avg Duration</p>
            <p className="text-2xl font-bold">
              {lessons.length > 0 
                ? Math.round(lessons.reduce((acc, l) => {
                    if (l.duration) {
                      const [min, sec] = l.duration.split(':').map(Number);
                      return acc + (min * 60 + sec);
                    }
                    return acc;
                  }, 0) / lessons.length / 60)
                : 0} min
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LessonList;