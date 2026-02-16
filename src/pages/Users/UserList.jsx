// pages/Users/UserList.js - Updated to work with infinite scroll table
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import UserTable from '../../components/Users/UserTable';
import { 
  getAllUsers, 
  toggleUserStatus,
  getPaginatedUsers,
  testUsersEndpoint,
  getMockUsers 
} from '../../services/userService';
import api from '../../services/api';
import Swal from 'sweetalert2';

const UserList = () => {
  const [allUsers, setAllUsers] = useState([]); // Store all fetched users
  const [displayedUsers, setDisplayedUsers] = useState([]); // Users to show (paginated)
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [useMockData, setUseMockData] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20; // Load 20 at a time
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    instructors: 0,
    students: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    initializeUsers();
  }, []);

  // Apply filters whenever searchTerm, roleFilter, or statusFilter change
  useEffect(() => {
    if (allUsers.length > 0) {
      filterAndDisplayUsers();
    }
  }, [searchTerm, roleFilter, statusFilter, allUsers]);

  const initializeUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setPage(1);
      
      console.log('🔍 Initializing users...');
      
      // Try to get real data first
      try {
        // Use paginated endpoint to get first page
        const result = await getPaginatedUsers(1, pageSize);
        
        console.log('Initial users result:', result);
        
        if (result && result.users) {
          setAllUsers(result.users);
          setDisplayedUsers(result.users);
          setTotalCount(result.total);
          setHasMore(result.users.length < result.total);
          calculateStats(result.users); // Stats based on current page
          setSuccess(`Loaded ${result.users.length} users`);
          
          // Fetch all data in background for accurate stats and filtering
          fetchAllUsersInBackground();
        } else {
          setError('No users found');
          loadMockData();
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        if (apiError.response?.status === 404 || !apiError.response) {
          console.warn('Using mock data due to API error');
          loadMockData();
          setError('Using mock data - backend not available');
        } else {
          throw apiError;
        }
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(`Failed to load users: ${error.message}`);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsersInBackground = async () => {
    try {
      // Fetch all users in the background for accurate stats and filtering
      const allData = await getAllUsers();
      setAllUsers(allData);
      setTotalCount(allData.length);
      calculateStats(allData);
      
      // Refresh displayed users with new data but keep current filter
      filterAndDisplayUsers(allData);
      
      console.log(`Background fetch complete: ${allData.length} total users`);
    } catch (error) {
      console.error('Background fetch error:', error);
    }
  };

  const loadMockData = () => {
    console.log('Loading mock user data...');
    const mockData = getMockUsers(150); // Generate 150 mock users
    setAllUsers(mockData);
    setTotalCount(mockData.length);
    
    // Initially show first 20
    const initialDisplay = mockData.slice(0, pageSize);
    setDisplayedUsers(initialDisplay);
    setHasMore(mockData.length > pageSize);
    
    calculateStats(mockData);
    setUseMockData(true);
  };

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      if (useMockData) {
        // For mock data, simulate pagination from allUsers
        const start = nextPage * pageSize - pageSize;
        const end = nextPage * pageSize;
        const moreUsers = allUsers.slice(start, end);
        
        if (moreUsers.length > 0) {
          setDisplayedUsers(prev => [...prev, ...moreUsers]);
          setPage(nextPage);
          setHasMore(end < allUsers.length);
        } else {
          setHasMore(false);
        }
      } else {
        // For real API, fetch next page
        const result = await getPaginatedUsers(nextPage, pageSize, {
          search: searchTerm,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
        
        if (result && result.users && result.users.length > 0) {
          setDisplayedUsers(prev => [...prev, ...result.users]);
          setPage(nextPage);
          setHasMore(result.users.length === pageSize && 
                     (nextPage * pageSize) < result.total);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more users:', error);
      setError('Failed to load more users');
    } finally {
      setLoadingMore(false);
    }
  };

  const filterAndDisplayUsers = (allData = allUsers) => {
    // Apply filters to all data
    let filtered = [...allData];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.full_name && user.full_name.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.first_name && user.first_name.toLowerCase().includes(term)) ||
        (user.last_name && user.last_name.toLowerCase().includes(term))
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.role === roleFilter || 
        (roleFilter === 'student' && (user.role === 'student' || user.role === 'user'))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => {
        if (user.is_active !== undefined) {
          return user.is_active === isActive;
        } else if (user.status) {
          return (user.status === 'active') === isActive;
        }
        return false;
      });
    }
    
    // Update total count for filtered results
    setTotalCount(filtered.length);
    
    // Show first page of filtered data
    const initialDisplay = filtered.slice(0, pageSize);
    setDisplayedUsers(initialDisplay);
    setPage(1);
    setHasMore(filtered.length > pageSize);
    
    // Update stats based on filtered data
    calculateStats(filtered);
  };

  const calculateStats = (userData) => {
    const active = userData.filter(u => {
      if (u.is_active !== undefined) return u.is_active;
      if (u.status) return u.status === 'active';
      return false;
    }).length;
    
    const admins = userData.filter(u => u.role === 'admin').length;
    const instructors = userData.filter(u => u.role === 'instructor').length;
    const students = userData.filter(u => u.role === 'student' || u.role === 'user').length;
    
    setStats({
      total: userData.length,
      active,
      inactive: userData.length - active,
      admins,
      instructors,
      students
    });
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // Determine the actual current status
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const isActive = user.is_active !== undefined ? user.is_active : user.status === 'active';
    
    try {
      if (useMockData) {
        // Mock toggle
        const updatedAllUsers = allUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                is_active: !isActive,
                status: !isActive ? 'active' : 'inactive'
              }
            : u
        );
        
        setAllUsers(updatedAllUsers);
        
        const updatedDisplayed = displayedUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                is_active: !isActive,
                status: !isActive ? 'active' : 'inactive'
              }
            : u
        );
        
        setDisplayedUsers(updatedDisplayed);
        calculateStats(updatedAllUsers);
        setSuccess(`User ${!isActive ? 'activated' : 'deactivated'} successfully (mock)`);
      } else {
        // Real API toggle
        await toggleUserStatus(userId);
        
        // Update local state
        const updatedAllUsers = allUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                is_active: !isActive,
                status: !isActive ? 'active' : 'inactive'
              }
            : u
        );
        
        setAllUsers(updatedAllUsers);
        
        const updatedDisplayed = displayedUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                is_active: !isActive,
                status: !isActive ? 'active' : 'inactive'
              }
            : u
        );
        
        setDisplayedUsers(updatedDisplayed);
        calculateStats(updatedAllUsers);
        setSuccess(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update user status');
      console.error('Toggle status error:', error);
    }
  };

  const handleEdit = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  const handleRefresh = () => {
    setPage(1);
    if (useMockData) {
      loadMockData();
    } else {
      initializeUsers();
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const handleExport = () => {
    // Create CSV data from all users (not just displayed)
    const csvData = allUsers.map(user => ({
      ID: user.id,
      Name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      Email: user.email,
      Username: user.username,
      Role: user.role,
      Status: user.is_active !== undefined ? (user.is_active ? 'Active' : 'Inactive') : user.status,
      'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
      'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'
    }));
    
    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSuccess(`Exported ${allUsers.length} users to CSV`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDebug = async () => {
    try {
      const result = await testUsersEndpoint();
      
      Swal.fire({
        title: 'Debug Results',
        html: `
          <div class="text-left" style="max-height: 400px; overflow-y: auto;">
            <p><strong>Success:</strong> ${result.success ? '✅' : '❌'}</p>
            <p><strong>Status:</strong> ${result.status || 'N/A'}</p>
            <p><strong>Message:</strong> ${result.message || 'N/A'}</p>
            ${result.totalFromHeaders ? `<p><strong>Total from Headers:</strong> ${result.totalFromHeaders}</p>` : ''}
            <p><strong>Has Users:</strong> ${result.hasUsers ? 'Yes' : 'No'}</p>
            <hr class="my-2">
            <p><strong>Data Preview:</strong></p>
            <pre class="bg-gray-100 p-2 rounded text-xs">${JSON.stringify(result.data, null, 2).substring(0, 500)}${JSON.stringify(result.data, null, 2).length > 500 ? '...' : ''}</pre>
          </div>
        `,
        icon: result.success ? 'info' : 'error',
        width: '600px'
      });
    } catch (error) {
      Swal.fire('Debug Error', error.message, 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600">
              {useMockData 
                ? '🔧 Using mock data - Backend not available' 
                : `📊 Managing ${totalCount} total users`}
            </p>
            {!loading && (
              <p className="text-sm text-gray-500">
                Showing {displayedUsers.length} of {totalCount} users
                {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && ' (filtered)'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
              title="Refresh users"
            >
              <i className={`fas fa-sync-alt mr-2 ${loading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              disabled={allUsers.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <i className="fas fa-download mr-2"></i>
              Export CSV ({allUsers.length})
            </button>
            
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
              title="Toggle debug panel"
            >
              <i className="fas fa-bug mr-2"></i>
              Debug
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">🔍 Debug Information</h3>
              <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-1">
              <p><span className="text-gray-400">Total users (all):</span> {allUsers.length}</p>
              <p><span className="text-gray-400">Displayed users:</span> {displayedUsers.length}</p>
              <p><span className="text-gray-400">Total count from API:</span> {totalCount}</p>
              <p><span className="text-gray-400">Current page:</span> {page}</p>
              <p><span className="text-gray-400">Has more:</span> {hasMore ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Using mock data:</span> {useMockData ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Search term:</span> "{searchTerm}"</p>
              <p><span className="text-gray-400">Role filter:</span> {roleFilter}</p>
              <p><span className="text-gray-400">Status filter:</span> {statusFilter}</p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleDebug}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Test API Endpoint
                </button>
                <button
                  onClick={() => {
                    setUseMockData(false);
                    initializeUsers();
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Retry Real Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="space-y-2">
          {error && (
            <Alert 
              type={useMockData ? "warning" : "error"} 
              message={error} 
              onClose={() => setError('')} 
            />
          )}
          {success && (
            <Alert 
              type="success" 
              message={success} 
              onClose={() => setSuccess('')} 
            />
          )}
          {useMockData && (
            <Alert 
              type="info" 
              message="Using mock data. Backend is not available. Some features may be limited." 
              onClose={() => {}} 
            />
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, username..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Filter
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles ({stats.admins + stats.instructors + stats.students})</option>
                <option value="admin">Admins ({stats.admins})</option>
                <option value="instructor">Instructors ({stats.instructors})</option>
                <option value="student">Students ({stats.students})</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status ({stats.active + stats.inactive})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="inactive">Inactive ({stats.inactive})</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                <i className="fas fa-times mr-1"></i>
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Students</p>
            <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
          </div>
        </div>

        {/* User table with infinite scroll */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 mt-4">
              {useMockData ? 'Loading mock data...' : 'Loading users...'}
            </span>
          </div>
        ) : (
          <UserTable
            users={displayedUsers}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            hasMore={hasMore}
            onLoadMore={loadMoreUsers}
            loadingMore={loadingMore}
            totalCount={totalCount}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default UserList;