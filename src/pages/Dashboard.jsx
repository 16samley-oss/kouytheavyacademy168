import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentPayments from '../components/Dashboard/RecentPayments';
import ChartComponent from '../components/Dashboard/ChartComponent';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import DashboardBackupButton from '../components/Dashboard/DashboardBackupButton'; // Add this import
import { getDashboardStats, getPayments } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard stats
      const statsData = await getDashboardStats();
      setStats(statsData);
      
      // Get recent payments
      const paymentsData = await getPayments({ 
        limit: 5, 
        sort: 'desc',
        skip: 0 
      });
      
      // Handle different response formats
      if (paymentsData && Array.isArray(paymentsData)) {
        setRecentPayments(paymentsData.slice(0, 5));
      } else if (paymentsData && paymentsData.payments) {
        // If API returns { payments: [], total: number }
        setRecentPayments(paymentsData.payments.slice(0, 5));
      } else {
        // Mock recent payments for demo (fallback)
        setRecentPayments([
          {
            id: 1,
            transaction_id: 'ELRN-20240115-ABC123',
            user: { full_name: 'John Doe', email: 'john@example.com' },
            course: { title: 'Web Development Bootcamp' },
            amount: 99.99,
            status: 'paid',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            transaction_id: 'ELRN-20240115-XYZ789',
            user: { full_name: 'Jane Smith', email: 'jane@example.com' },
            course: { title: 'Data Science Fundamentals' },
            amount: 149.99,
            status: 'pending',
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            transaction_id: 'ELRN-20240114-DEF456',
            user: { full_name: 'Bob Johnson', email: 'bob@example.com' },
            course: { title: 'Mobile App Development' },
            amount: 79.99,
            status: 'paid',
            created_at: new Date().toISOString()
          }
        ]);
      }
      
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // Fallback to mock data
      setStats({
        total_users: 25,
        total_courses: 12,
        total_revenue: 1850.50,
        pending_payments: 3,
        active_enrollments: 18,
        recent_payments: 7,
        revenue_change: 23.5,
        current_month_revenue: 850.50,
        previous_month_revenue: 689.25
      });
      
      // Show error message
      if (error.response?.status === 404) {
        setError('Dashboard stats endpoint not configured. Using demo data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="mt-3 text-gray-600">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your platform.
              {lastUpdated && (
                <span className="text-sm text-gray-500 ml-2">
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            <Link
              to="/backup"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center"
            >
              <i className="fas fa-database mr-2"></i>
              Backup Panel
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
              <span className="text-yellow-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon="fas fa-users"
            color="blue"
            change={`+${Math.round((stats?.total_users || 0) * 0.12)} this month`}
            link="/admin/users"
          />
          <StatsCard
            title="Total Courses"
            value={stats?.total_courses || 0}
            icon="fas fa-book"
            color="green"
            change={`${stats?.active_enrollments || 0} active enrollments`}
            link="/admin/courses"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats?.total_revenue || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`}
            icon="fas fa-dollar-sign"
            color="purple"
            change={`${stats?.revenue_change > 0 ? '↗' : '↘'} ${Math.abs(stats?.revenue_change || 0)}%`}
            link="/admin/payments"
          />
          <StatsCard
            title="Pending Payments"
            value={stats?.pending_payments || 0}
            icon="fas fa-clock"
            color="yellow"
            change={`${stats?.recent_payments || 0} recent payments`}
            link="/admin/payments?status=pending"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                  7 Days
                </button>
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">
                  30 Days
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                  90 Days
                </button>
              </div>
            </div>
            <ChartComponent 
              currentMonthRevenue={stats?.current_month_revenue || 0}
              previousMonthRevenue={stats?.previous_month_revenue || 0}
            />
          </div>

          {/* Right sidebar - Quick Actions & Backup */}
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin/courses/new"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-plus text-blue-600"></i>
                  </div>
                  <div>
                    <span className="font-medium">Add New Course</span>
                    <p className="text-sm text-gray-600">Create a new learning course</p>
                  </div>
                </Link>
                
                <Link
                  to="/admin/users/new"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-user-plus text-green-600"></i>
                  </div>
                  <div>
                    <span className="font-medium">Add New User</span>
                    <p className="text-sm text-gray-600">Create a new user account</p>
                  </div>
                </Link>
                
                <Link
                  to="/backup"
                  className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <i className="fas fa-database text-indigo-600"></i>
                  </div>
                  <div>
                    <span className="font-medium">Backup Database</span>
                    <p className="text-sm text-gray-600">Full backup & restore panel</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Backup Card */}
            <DashboardBackupButton />
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Link to="/admin/payments" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>
          <RecentPayments payments={recentPayments} />
          
          {recentPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-receipt text-3xl mb-2"></i>
              <p>No recent payments found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;