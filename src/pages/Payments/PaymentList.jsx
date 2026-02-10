import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import Alert from '../../components/Common/Alert';
import PaymentTable from '../../components/Payments/PaymentTable';
import { 
  getAllPayments, 
  verifyPayment, 
  verifyBulkPayments,
  exportPayments,
  getMockPayments,
  checkPaymentsHealth 
} from '../../services/paymentService';
import { CSVLink } from 'react-csv';
import Swal from 'sweetalert2';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    pending: 0,
    paid: 0,
    failed: 0,
    successRate: 0
  });

  useEffect(() => {
    initializePayments();
  }, []);

  const initializePayments = async () => {
    try {
      setLoading(true);
      // Check if backend is available
      const isHealthy = await checkPaymentsHealth();
      
      if (!isHealthy) {
        setUseMockData(true);
        setError('Using mock data - backend is not available');
        loadMockData();
      } else {
        await fetchPayments();
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setUseMockData(true);
      setError('Using mock data due to connection error');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockData = getMockPayments();
    setPayments(mockData);
    updateStats(mockData);
    prepareCSVData(mockData);
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data);
      updateStats(data);
      prepareCSVData(data);
      setSuccess('Payments loaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments. Using mock data instead.');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data) => {
    const paidPayments = data.filter(p => p.status === 'paid');
    const pendingPayments = data.filter(p => p.status === 'pending');
    const failedPayments = data.filter(p => p.status === 'failed');
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const successRate = data.length > 0 
      ? Math.round((paidPayments.length / data.length) * 100) 
      : 0;

    setStats({
      total: data.length,
      totalRevenue,
      pending: pendingPayments.length,
      paid: paidPayments.length,
      failed: failedPayments.length,
      successRate
    });
  };

  const prepareCSVData = (data) => {
    const formattedData = data.map(payment => ({
      'ID': payment.id,
      'Transaction ID': payment.transaction_id || 'N/A',
      'User ID': payment.user_id,
      'User Name': payment.user?.full_name || payment.user?.username || 'Unknown',
      'User Email': payment.user?.email || '',
      'Course ID': payment.course_id,
      'Course Title': payment.course?.title || 'Unknown Course',
      'Amount': payment.amount,
      'Currency': payment.currency || 'USD',
      'Status': payment.status,
      'Payment Method': payment.payment_method || 'bakong',
      'Created At': formatDateForCSV(payment.created_at),
      'Paid At': payment.paid_at ? formatDateForCSV(payment.paid_at) : 'N/A',
      'MD5 Hash': payment.khqr_md5 || ''
    }));

    setCsvData(formattedData);
  };

  const formatDateForCSV = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleVerify = async (md5Hash, paymentId) => {
    if (useMockData) {
      // Mock verification for demo
      Swal.fire({
        title: 'Mock Verification',
        text: `Payment ${paymentId} would be verified with MD5: ${md5Hash}`,
        icon: 'info'
      });
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyPayment(md5Hash);
      
      if (result.status === 'PAID') {
        setSuccess(`Payment ${paymentId} verified successfully!`);
        
        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === paymentId 
            ? { 
                ...p, 
                status: 'paid', 
                paid_at: new Date().toISOString(),
                course_id: result.course_id || p.course_id
              }
            : p
        ));
        
        // Refresh stats
        fetchPayments();
      } else {
        setError(`Payment ${paymentId} is still pending. Status: ${result.status}`);
      }
      
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    } catch (error) {
      setError(`Failed to verify payment ${paymentId}: ${error.message}`);
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleRefresh = async (paymentId) => {
    try {
      await fetchPayments();
      setSuccess(`Payment list refreshed`);
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      setError('Failed to refresh payments');
      console.error('Refresh error:', error);
    }
  };

  const handleBulkVerify = async () => {
    const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
    
    if (pendingPayments.length === 0) {
      setError('No pending payments to verify');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (useMockData) {
      Swal.fire({
        title: 'Mock Bulk Verification',
        text: `Would verify ${pendingPayments.length} pending payments`,
        icon: 'info'
      });
      return;
    }

    try {
      setBulkLoading(true);
      const md5Hashes = pendingPayments
        .filter(p => p.khqr_md5)
        .map(p => p.khqr_md5);
      
      if (md5Hashes.length === 0) {
        setError('No valid payments for bulk verification');
        return;
      }

      const results = await verifyBulkPayments(md5Hashes);
      
      if (results.verified && results.verified.length > 0) {
        setSuccess(`Successfully verified ${results.verified.length} payments!`);
        
        // Update local state for verified payments
        setPayments(prev => prev.map(p => {
          if (results.verified.includes(p.khqr_md5)) {
            return { 
              ...p, 
              status: 'paid', 
              paid_at: new Date().toISOString() 
            };
          }
          return p;
        }));
        
        fetchPayments(); // Refresh to get updated stats
      } else {
        setError('No payments were verified');
      }
    } catch (error) {
      setError(`Bulk verification failed: ${error.message}`);
      console.error('Bulk verification error:', error);
    } finally {
      setBulkLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  const handleExportSelected = () => {
    const selectedData = csvData.filter((_, index) => 
      selectedPayments.includes(filteredPayments[index]?.id)
    );
    
    if (selectedData.length === 0) {
      setError('No payments selected for export');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // The CSVLink component will handle the download
    document.getElementById('selected-csv-link')?.click();
  };

  const handleExportAll = async () => {
    try {
      if (useMockData) {
        // Use CSVLink for mock data
        document.getElementById('all-csv-link')?.click();
      } else {
        // Use API export for real data
        await exportPayments('csv');
        setSuccess('Export started successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to export payments');
      console.error('Export error:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  // Get selected payments data for export
  const getSelectedCSVData = () => {
    return csvData.filter((_, index) => 
      selectedPayments.includes(filteredPayments[index]?.id)
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
            <p className="text-gray-600">
              {useMockData ? 'Using mock data - Backend not available' : 'Monitor, verify, and export all transactions'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments ({stats.total})</option>
              <option value="pending">Pending ({stats.pending})</option>
              <option value="paid">Paid ({stats.paid})</option>
              <option value="failed">Failed ({stats.failed})</option>
            </select>
            
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              title="Refresh all payments"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
            
            <button
              onClick={handleBulkVerify}
              disabled={bulkLoading || stats.pending === 0 || useMockData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {bulkLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle mr-2"></i>
                  Verify All Pending ({stats.pending})
                </>
              )}
            </button>
          </div>
        </div>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <i className="fas fa-wallet text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <i className="fas fa-money-bill-wave text-green-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <i className="fas fa-clock text-yellow-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <i className="fas fa-chart-line text-purple-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Actions */}
        {selectedPayments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-blue-600 mr-2"></i>
                <span className="font-medium">
                  {selectedPayments.length} payment{selectedPayments.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm flex items-center"
                >
                  <i className="fas fa-download mr-1"></i>
                  Export Selected
                </button>
                <button
                  onClick={() => setSelectedPayments([])}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm flex items-center"
                >
                  <i className="fas fa-times mr-1"></i>
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600 mt-4">
              {useMockData ? 'Loading mock data...' : 'Loading payments...'}
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <PaymentTable
              payments={filteredPayments}
              onVerify={handleVerify}
              onRefresh={handleRefresh}
              selectedPayments={selectedPayments}
              onSelectPayment={handlePaymentSelect}
              onSelectAll={handleSelectAll}
              verifying={verifying}
              useMockData={useMockData}
            />
          </div>
        )}

        {/* Hidden CSV Links */}
        <div className="hidden">
          <CSVLink
            id="all-csv-link"
            data={csvData}
            filename={`payments_export_all_${new Date().toISOString().split('T')[0]}.csv`}
          >
            Export All
          </CSVLink>
          <CSVLink
            id="selected-csv-link"
            data={getSelectedCSVData()}
            filename={`payments_export_selected_${new Date().toISOString().split('T')[0]}.csv`}
          >
            Export Selected
          </CSVLink>
        </div>

        {/* Export & Bulk Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Export & Bulk Actions</h3>
              <p className="text-gray-600 text-sm">
                {useMockData 
                  ? 'Export mock data for testing' 
                  : 'Export payments data or perform bulk operations'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center"
              >
                <i className="fas fa-file-csv mr-2"></i>
                Export All to CSV
              </button>
              
              <button
                onClick={() => {
                  Swal.fire({
                    title: 'More Actions',
                    text: 'Additional bulk actions would be implemented here',
                    icon: 'info'
                  });
                }}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition inline-flex items-center"
              >
                <i className="fas fa-cog mr-2"></i>
                More Actions
              </button>
              
              {useMockData && (
                <button
                  onClick={() => {
                    setUseMockData(false);
                    fetchPayments();
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition inline-flex items-center"
                >
                  <i className="fas fa-sync mr-2"></i>
                  Retry Real Data
                </button>
              )}
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Quick Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{stats.paid}</div>
                <div className="text-xs text-gray-500">Paid</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-gray-500">Failed</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentList;