import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import { getUser, updateUser } from '../../services/userService';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    role: 'user',
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const data = await getUser(id);
      setUser(data);
      setFormData({
        full_name: data.full_name,
        email: data.email,
        username: data.username,
        role: data.role,
      });
    } catch (err) {
      setError('Failed to load user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      await updateUser(id, formData);
      setSuccess('User updated successfully!');
      setUser({ ...user, ...formData });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user');
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800">User Not Found</h2>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/users')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Users
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
            <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
            <p className="text-gray-600">Update user information</p>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Users
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}

        {/* User info */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-user text-blue-600 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin'
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
                  <span className="text-sm text-gray-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* User stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Enrollments</p>
            <p className="text-2xl font-bold">{user.enrollments?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Payments</p>
            <p className="text-2xl font-bold">{user.payments?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Account Age</p>
            <p className="text-2xl font-bold">
              {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserEdit;