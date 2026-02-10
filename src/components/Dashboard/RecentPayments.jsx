import React, { useState, useEffect } from 'react';
import { getPayments } from '../../services/paymentService';

const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPayments();
  }, []);

  const fetchRecentPayments = async () => {
    try {
      const data = await getPayments({ limit: 5 });
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent payments</p>
      ) : (
        payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">Transaction #{payment.transaction_id}</p>
              <p className="text-sm text-gray-500">
                {payment.user?.full_name || 'Unknown User'} • Course #{payment.course_id}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">${payment.amount}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                {payment.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{formatDate(payment.created_at)}</p>
            </div>
          </div>
        ))
      )}
      
      <button className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
        View all payments →
      </button>
    </div>
  );
};

export default RecentPayments;