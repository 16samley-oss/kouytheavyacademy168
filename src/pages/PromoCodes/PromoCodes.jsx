// src/pages/PromoCodes/PromoCodes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import promoCodeService from '../../services/promoCodeService';

const PromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired
  const [stats, setStats] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchPromoCodes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'active') params.active_only = true;
      if (filter === 'expired') params.include_expired = true;
      
      const data = await promoCodeService.getPromoCodes(params);
      setPromoCodes(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await promoCodeService.getPromoCodesOverview();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
    fetchStats();
  }, [fetchPromoCodes, fetchStats]);

  const handleDelete = async (id) => {
    try {
      await promoCodeService.deletePromoCode(id);
      toast.success('Promo code deleted successfully');
      fetchPromoCodes();
      fetchStats();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete promo code');
    }
  };

  const getStatusBadge = (promo) => {
    const now = new Date();
    const validFrom = new Date(promo.valid_from);
    const validUntil = new Date(promo.valid_until);
    
    if (!promo.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (now < validFrom) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Scheduled</span>;
    }
    if (now > validUntil) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    if (promo.current_uses >= promo.max_uses) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Used Up</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
  };

  const getDiscountDisplay = (promo) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}%`;
    } else {
      return `$${promo.discount_value}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
        <Link
          to="/promocodes/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Promo Code
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-tags text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Promos</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_promos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-check-circle text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active_promos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-clock text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Uses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_uses}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Discount Given</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${stats.total_discount_given?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md ${
              filter === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-md ${
              filter === 'expired' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading promo codes...</p>
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-tags text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-600">No promo codes found</p>
            <Link
              to="/promocodes/create"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first promo code
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Purchase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{promo.code}</div>
                    {promo.description && (
                      <div className="text-sm text-gray-500">{promo.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium">{getDiscountDisplay(promo)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-medium">{promo.current_uses}</span>
                      <span className="text-gray-500"> / {promo.max_uses}</span>
                    </div>
                    <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-1 bg-blue-600 rounded-full"
                        style={{ width: `${(promo.current_uses / promo.max_uses) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>From: {format(new Date(promo.valid_from), 'MMM dd, yyyy')}</div>
                    <div>To: {format(new Date(promo.valid_until), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    ${promo.minimum_purchase?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(promo)}
                  </td>
                  <td className="px-6 py-4">
                    {promo.courses && promo.courses.length > 0 ? (
                      <div className="text-sm">
                        {promo.courses.slice(0, 2).map(c => c.title).join(', ')}
                        {promo.courses.length > 2 && ` +${promo.courses.length - 2} more`}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">All courses</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/promocodes/${promo.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link
                        to={`/promocodes/edit/${promo.id}`}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(promo.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this promo code? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodes;