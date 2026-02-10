import React from 'react';
import Table from '../Common/Table';

const UserTable = ({ users, onEdit, onToggleStatus }) => {
  const columns = [
    {
      header: 'User',
      accessor: 'full_name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-user text-blue-600"></i>
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{row.full_name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Username',
      accessor: 'username',
      cell: (row) => (
        <div className="text-sm text-gray-900">@{row.username}</div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Joined Date',
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
            onClick={() => onToggleStatus && onToggleStatus(row.id, row.is_active)}
            className={`text-sm px-3 py-1 rounded ${
              row.is_active
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onEdit && onEdit(row.id)}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      emptyMessage="No users found"
    />
  );
};

export default UserTable;