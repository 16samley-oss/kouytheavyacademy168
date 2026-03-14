// src/pages/PromoCodes/PromoCodeDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import promoCodeService from '../../services/promoCodeService';

const PromoCodeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promo, setPromo] = useState(null);
  const [usage, setUsage] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // details, usage

  useEffect(() => {
    fetchPromoDetails();
  }, [id]);

  const fetchPromoDetails = async () => {
    try {
      setLoading(true);
      const [promoData, usageData, statsData] = await Promise.all([
        promoCodeService.getPromoCodeById(id),
        promoCodeService.getPromoCodeUsage(id),
        promoCodeService.getPromoCodeStats(id)
      ]);
      
      setPromo(promoData);
      setUsage(usageData);
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch promo code details');
      navigate('/promocodes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!promo) return null;
    
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading promo code details...</p>
      </div>
    );
  }

  if (!promo) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promo Code Details</h1>
          <p className="text-gray-600">Code: <span className="font-mono font-bold">{promo.code}</span></p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/promocodes"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to List
          </Link>
          <Link
            to={`/promocodes/edit/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Promo Code
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-percent text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Discount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {promo.discount_type === 'percentage' 
                  ? `${promo.discount_value}%` 
                  : `$${promo.discount_value}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {promo.current_uses} / {promo.max_uses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-dollar-sign text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Discount</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats?.total_discount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div>{getStatusBadge()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usage History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Code</dt>
              <dd className="mt-1 text-lg text-gray-900 font-mono">{promo.code}</dd>
            </div>

            {promo.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-gray-900">{promo.description}</dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500">Discount Type</dt>
              <dd className="mt-1 text-gray-900 capitalize">{promo.discount_type}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Discount Value</dt>
              <dd className="mt-1 text-gray-900">
                {promo.discount_type === 'percentage' 
                  ? `${promo.discount_value}%` 
                  : `$${promo.discount_value}`}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Valid From</dt>
              <dd className="mt-1 text-gray-900">
                {format(new Date(promo.valid_from), 'PPP p')}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Valid Until</dt>
              <dd className="mt-1 text-gray-900">
                {format(new Date(promo.valid_until), 'PPP p')}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Maximum Uses</dt>
              <dd className="mt-1 text-gray-900">{promo.max_uses}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Current Uses</dt>
              <dd className="mt-1 text-gray-900">{promo.current_uses}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Minimum Purchase</dt>
              <dd className="mt-1 text-gray-900">
                {promo.minimum_purchase > 0 ? `$${promo.minimum_purchase}` : 'No minimum'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-gray-900">Admin ID: {promo.created_by}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">
                {format(new Date(promo.created_at), 'PPP p')}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-gray-900">
                {promo.updated_at ? format(new Date(promo.updated_at), 'PPP p') : 'Never'}
              </dd>
            </div>
          </dl>

          {/* Applicable Courses */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Applicable Courses</h3>
            {promo.courses && promo.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promo.courses.map(course => (
                  <div key={course.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <Link to={`/courses/${course.id}`} className="block">
                      <h4 className="font-medium text-blue-600 hover:text-blue-800">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600">${course.price}</p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Applies to all courses</p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {usage.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-history text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600">No usage history found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usage.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {item.user?.full_name || `User #${item.user_id}`}
                        </div>
                        {item.user?.email && (
                          <div className="text-gray-500">{item.user.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/payments/${item.payment_id}`}
                        className="text-sm text-blue-600 hover:text-blue-900"
                      >
                        Payment #{item.payment_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${item.original_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      -${item.discount_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${item.final_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.used_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeDetails;