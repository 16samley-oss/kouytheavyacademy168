import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import CourseTable from '../../components/Courses/CourseTable';
import { getAllCourses, deleteCourse } from '../../services/courseService';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data);
    } catch (error) {
      setError('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (courseId) => {
    navigate(`/courses/edit/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        setSuccess('Course deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete course');
        console.error(error);
      }
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      // You'll need to implement this API endpoint
      // await toggleCoursePublish(courseId);
      setCourses(courses.map(course => 
        course.id === courseId 
          ? { ...course, is_published: !currentStatus }
          : course
      ));
    } catch (error) {
      setError('Failed to update course status');
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
            <p className="text-gray-600">Manage your courses</p>
          </div>
          <button
            onClick={() => navigate('/courses/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Course</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* Course table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <CourseTable
              courses={courses}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          </div>
        )}

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Courses</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold">
              {courses.filter(c => c.is_published).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Paid Courses</p>
            <p className="text-2xl font-bold">
              {courses.filter(c => c.course_type === 'paid').length}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseList;