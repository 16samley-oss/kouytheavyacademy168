import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Table from '../../components/Common/Table';
import { getEnrollments } from '../../services/api';

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const data = await getEnrollments();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-user text-blue-600"></i>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{row.user?.full_name}</div>
            <div className="text-sm text-gray-500">{row.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Course',
      cell: (row) => (
        <div className="font-medium text-gray-900">{row.course?.title}</div>
      ),
    },
    {
      header: 'Enrollment Date',
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {new Date(row.enrolled_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.completed
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.completed ? 'Completed' : 'In Progress'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
          View Details
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Enrollments</h1>
            <p className="text-gray-600">Track student course enrollments</p>
          </div>
          <div className="flex space-x-4">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
            <button
              onClick={() => fetchEnrollments()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Enrollments</p>
            <p className="text-2xl font-bold">{enrollments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Students</p>
            <p className="text-2xl font-bold">
              {new Set(enrollments.map(e => e.user_id)).size}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold">
              {enrollments.length > 0
                ? `${Math.round((enrollments.filter(e => e.completed).length / enrollments.length) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>

        {/* Enrollment table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <Table
              columns={columns}
              data={enrollments}
              emptyMessage="No enrollments found"
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EnrollmentList;