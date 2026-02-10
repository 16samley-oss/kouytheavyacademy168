import React from 'react';
import Table from '../Common/Table';

const LessonTable = ({ lessons, onEdit, onDelete, onTogglePublish }) => {
  const columns = [
    {
      header: 'Lesson',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {row.description || 'No description'}
          </div>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessor: 'duration',
      cell: (row) => (
        <div className="text-sm font-medium">
          {row.duration || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Order',
      accessor: 'order',
      cell: (row) => (
        <div className="text-sm font-medium">{row.order}</div>
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
          {new Date(row.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => onTogglePublish && onTogglePublish(row.id, row.is_published)}
            className={`text-sm px-3 py-1 rounded ${
              row.is_published
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {row.is_published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => onEdit && onEdit(row.id)}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(row.id)}
            className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
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
      data={lessons}
      emptyMessage="No lessons found. Create your first lesson!"
    />
  );
};

export default LessonTable;