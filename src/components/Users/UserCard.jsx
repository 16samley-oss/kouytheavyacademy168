import React from 'react';

const UserCard = ({ user, onEdit, onToggleStatus }) => {
  const isAdmin = user.role === 'admin';

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-user text-blue-600"></i>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user.role}
              </span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-sm text-gray-500">Joined</p>
          <p className="text-sm font-medium">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={() => onToggleStatus && onToggleStatus(user.id, user.is_active)}
          className={`px-3 py-1 rounded text-sm ${
            user.is_active
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {user.is_active ? 'Deactivate' : 'Activate'}
        </button>
        
        <button
          onClick={() => onEdit && onEdit(user.id)}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default UserCard;