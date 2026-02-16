// components/Users/UserTable.js - WITH INFINITE SCROLLING
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Table from '../Common/Table';
import LoadingSpinner from '../Common/LoadingSpinner';

const UserTable = ({ 
  users = [], 
  onEdit, 
  onToggleStatus,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  totalCount = 0 
}) => {
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const observerRef = useRef();
  const loaderRef = useCallback(node => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && onLoadMore) {
        onLoadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore, onLoadMore]);

  // Update displayed users when the users prop changes
  useEffect(() => {
    setDisplayedUsers(users);
  }, [users]);

  const columns = [
    {
      header: 'User',
      accessor: 'full_name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {row.profile_image ? (
              <img 
                src={row.profile_image} 
                alt={row.full_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-blue-600"></i>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim()}</div>
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
      cell: (row) => {
        // Handle different role formats
        const role = row.role || 'user';
        const roleColors = {
          admin: 'bg-purple-100 text-purple-800',
          instructor: 'bg-blue-100 text-blue-800',
          student: 'bg-green-100 text-green-800',
          user: 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              roleColors[role] || roleColors.user
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (row) => {
        // Handle both is_active and status fields
        const isActive = row.is_active !== undefined 
          ? row.is_active 
          : row.status === 'active';
        
        return (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      header: 'Joined Date',
      accessor: 'created_at',
      cell: (row) => {
        try {
          return (
            <div className="text-sm text-gray-900">
              {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
            </div>
          );
        } catch (error) {
          return <div className="text-sm text-gray-900">Invalid date</div>;
        }
      },
    },
    {
      header: 'Last Login',
      accessor: 'last_login',
      cell: (row) => {
        try {
          return (
            <div className="text-sm text-gray-900">
              {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never'}
            </div>
          );
        } catch (error) {
          return <div className="text-sm text-gray-900">Never</div>;
        }
      },
    },
    {
      header: 'Actions',
      cell: (row) => {
        const isActive = row.is_active !== undefined 
          ? row.is_active 
          : row.status === 'active';
        
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onToggleStatus && onToggleStatus(row.id, isActive)}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                isActive
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => onEdit && onEdit(row.id)}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
            >
              Edit
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative">
      <Table
        columns={columns}
        data={displayedUsers}
        emptyMessage="No users found"
      />
      
      {/* Infinite scroll loader */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center items-center py-4 border-t border-gray-200"
        >
          {loadingMore ? (
            <div className="flex items-center text-gray-500">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Loading more users...</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">Scroll for more users</span>
          )}
        </div>
      )}
      
      {/* End of list message */}
      {!hasMore && displayedUsers.length > 0 && (
        <div className="text-center py-4 border-t border-gray-200 text-gray-500 text-sm">
          <i className="fas fa-check-circle text-green-500 mr-2"></i>
          You've seen all {totalCount || displayedUsers.length} users
        </div>
      )}
      
      {/* Loading more indicator at bottom */}
      {loadingMore && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center border border-gray-200">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default UserTable;