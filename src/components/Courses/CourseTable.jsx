import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Table from '../Common/Table';

const CourseTable = ({ courses, onEdit, onDelete, onTogglePublish }) => {
  const navigate = useNavigate(); // Initialize navigate

  const columns = [
    {
      header: 'Course',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {row.thumbnail_url ? (
              <img
                src={row.thumbnail_url}
                alt={row.title}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                <i className="fas fa-book text-blue-600"></i>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{row.title}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.description?.substring(0, 60) || 'No description'}...
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'course_type',
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.course_type === 'paid'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.course_type?.toUpperCase() || 'FREE'}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      cell: (row) => (
        <div className="text-sm font-medium">
          {row.course_type === 'paid' ? `$${row.price || '0.00'}` : 'Free'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_published',
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.is_published
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.is_published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          {/* Manage Lessons Button */}
          <button
            onClick={() => navigate(`/courses/${row.id}/lessons`)}
            className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 flex items-center"
            title="Manage Lessons"
          >
            <i className="fas fa-list-ul mr-1"></i>
            Lessons
          </button>
          
          <button
            onClick={() => onTogglePublish && onTogglePublish(row.id, row.is_published)}
            className={`text-sm px-3 py-1 rounded ${
              row.is_published
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            title={row.is_published ? 'Unpublish Course' : 'Publish Course'}
          >
            {row.is_published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => onEdit && onEdit(row.id)}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            title="Edit Course"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(row.id)}
            className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
            title="Delete Course"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={courses}
      emptyMessage="No courses found. Create your first course!"
    />
  );
};

export default CourseTable;