import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import UserTable from '../../components/Users/UserTable';
import { getUsers, toggleUserStatus } from '../../services/userService';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      setError('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !currentStatus }
          : user
      ));
      setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update user status');
      console.error(error);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users</h1>
            <p className="text-gray-600">Manage platform users</p>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => fetchUsers()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* User table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <UserTable
              users={users}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.is_active).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserList;