import React from 'react';
import Table from '../Common/Table';

const PaymentTable = ({ payments, onVerify, onRefresh }) => {
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

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'BAKONG_QR':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR
          </span>
        );
      case 'SIMPLEPAY':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            SimplePay
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {method}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      header: 'Transaction ID',
      accessor: 'transaction_id',
      cell: (row) => (
        <div className="font-mono text-sm">{row.transaction_id}</div>
      ),
    },
    {
      header: 'Method',
      accessor: 'payment_method',
      cell: (row) => (
        <div className="flex items-center">
          {getPaymentMethodBadge(row.payment_method)}
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user',
      cell: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.user?.full_name || 'Unknown'}</div>
          <div className="text-gray-500 text-xs">{row.user?.email || ''}</div>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course',
      cell: (row) => (
        <div className="text-sm">
          <div className="font-medium">{row.course?.title || 'Course #' + row.course_id}</div>
          <div className="text-gray-500 text-xs">ID: {row.course_id}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (row) => (
        <div className="font-semibold">
          ${row.amount} {row.currency}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            row.status
          )}`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {formatDate(row.created_at)}
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => {
        // Determine verification identifier based on payment method
        const verifyIdentifier = row.payment_method === 'BAKONG_QR' 
          ? row.khqr_md5 
          : row.transaction_id;
        
        // Determine verification label
        const verifyLabel = row.payment_method === 'BAKONG_QR' 
          ? 'Verify QR'
          : 'Verify SimplePay';
        
        return (
          <div className="flex space-x-2">
            {row.status === 'pending' && verifyIdentifier && (
              <button
                onClick={() => onVerify && onVerify(verifyIdentifier, row.payment_method)}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                title={`Verify ${row.payment_method === 'BAKONG_QR' ? 'QR Payment' : 'SimplePay Payment'}`}
              >
                {verifyLabel}
              </button>
            )}
            <button
              onClick={() => onRefresh && onRefresh(row.id)}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
              title="Refresh payment status"
            >
              <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      data={payments}
      emptyMessage="No payments found"
    />
  );
};

export default PaymentTable;