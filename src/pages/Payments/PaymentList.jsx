// pages/Payments/PaymentList.js - WITH INFINITE SCROLLING
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  checkPaymentsHealth,
  testAdminPaymentsEndpoint,
  getPaginatedPayments
} from '../../services/paymentService';
import api from '../../services/api';
import { CSVLink } from 'react-csv';
import Swal from 'sweetalert2';

const PaymentList = () => {
  const [allPayments, setAllPayments] = useState([]);
  const [displayedPayments, setDisplayedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [useMockData, setUseMockData] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  const observerRef = useRef();
  const loaderRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePayments();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore]);

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

  useEffect(() => {
    if (allPayments.length > 0) {
      filterAndDisplayPayments();
    }
  }, [filter, allPayments]);

  const initializePayments = async () => {
    try {
      setLoading(true);
      setError('');
      setPage(1);
      
      const isHealthy = await checkPaymentsHealth();
      
      if (!isHealthy) {
        setUseMockData(true);
        setError('Using mock data - backend is not available');
        loadMockData();
      } else {
        await fetchInitialPayments();
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
    const mockData = getMockPayments(150);
    setAllPayments(mockData);
    setTotalCount(mockData.length);
    setDisplayedPayments(mockData.slice(0, pageSize));
    setHasMore(mockData.length > pageSize);
    updateStats(mockData);
    prepareCSVData(mockData);
    setSuccess(`Loaded ${mockData.length} mock payments for testing`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const fetchInitialPayments = async () => {
    try {
      setLoading(true);
      setError('');
      setPage(1);
      
      const result = await getPaginatedPayments(1, pageSize);
      
      if (result && result.payments) {
        setAllPayments(result.payments);
        setDisplayedPayments(result.payments);
        setTotalCount(result.total);
        setHasMore(result.payments.length < result.total);
        updateStats(result.payments);
        prepareCSVData(result.payments);
        setSuccess(`Loaded ${result.payments.length} payments`);
        fetchAllPaymentsInBackground();
      } else {
        setError('No payments found');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      
      if (error.response?.status === 404) {
        setError('Admin payments endpoint not found. Using mock data instead.');
        loadMockData();
      } else {
        setError(`Failed to load payments: ${error.message}. Using mock data.`);
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPaymentsInBackground = async () => {
    try {
      const allData = await getAllPayments();
      setAllPayments(allData);
      setTotalCount(allData.length);
      updateStats(allData);
      prepareCSVData(allData);
      filterAndDisplayPayments(allData);
    } catch (error) {
      console.error('Background fetch error:', error);
    }
  };

  const loadMorePayments = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      if (useMockData) {
        const start = (nextPage - 1) * pageSize;
        const end = nextPage * pageSize;
        const morePayments = allPayments.slice(start, end);
        
        if (morePayments.length > 0) {
          setDisplayedPayments(prev => [...prev, ...morePayments]);
          setPage(nextPage);
          setHasMore(end < allPayments.length);
        } else {
          setHasMore(false);
        }
      } else {
        const result = await getPaginatedPayments(nextPage, pageSize);
        
        if (result && result.payments && result.payments.length > 0) {
          setDisplayedPayments(prev => [...prev, ...result.payments]);
          setPage(nextPage);
          setHasMore(result.payments.length === pageSize && (nextPage * pageSize) < result.total);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more payments:', error);
      setError('Failed to load more payments');
    } finally {
      setLoadingMore(false);
    }
  };

  const filterAndDisplayPayments = (allData = allPayments) => {
    let filtered = allData;
    if (filter !== 'all') {
      filtered = allData.filter(p => p.status === filter);
    }
    
    setTotalCount(filtered.length);
    setDisplayedPayments(filtered.slice(0, pageSize));
    setPage(1);
    setHasMore(filtered.length > pageSize);
    updateStats(filtered);
  };

  const updateStats = (data) => {
    const paidPayments = data.filter(p => p.status === 'paid');
    const pendingPayments = data.filter(p => p.status === 'pending');
    const failedPayments = data.filter(p => p.status === 'failed');
    // ✅ Use amount (final/discounted price) for revenue
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
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
      // ✅ Include all amount fields in CSV
      'Final Amount': payment.amount,
      'Original Amount': payment.original_amount || payment.amount,
      'Discount Amount': payment.discount_amount || 0,
      'Promo Code': payment.promo_code?.code || '',
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

  // ✅ FIX: Correct signature — (verifyIdentifier, paymentMethod) matches what PaymentTable sends
  const handleVerify = async (verifyIdentifier, paymentMethod) => {
    if (!verifyIdentifier) {
      setError('No identifier available for verification');
      return;
    }

    if (useMockData) {
      Swal.fire({
        title: 'Mock Verification',
        text: `Payment would be verified with: ${verifyIdentifier}`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
      });

      // ✅ Match by transaction_id or khqr_md5 depending on method
      const updateFn = (p) => {
        const matches = paymentMethod === 'BAKONG_QR'
          ? p.khqr_md5 === verifyIdentifier
          : p.transaction_id === verifyIdentifier;
        return matches
          ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
          : p;
      };

      setAllPayments(prev => prev.map(updateFn));
      setDisplayedPayments(prev => prev.map(updateFn));
      updateStats(allPayments.map(updateFn));
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyPayment(verifyIdentifier);
      
      if (result.status === 'PAID' || result.paid) {
        setSuccess(`Payment verified successfully!`);
        
        // ✅ Match by the correct field depending on payment method
        const updateFn = (p) => {
          const matches = paymentMethod === 'BAKONG_QR'
            ? p.khqr_md5 === verifyIdentifier
            : p.transaction_id === verifyIdentifier;
          return matches
            ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
            : p;
        };

        setAllPayments(prev => {
          const updated = prev.map(updateFn);
          updateStats(updated);
          return updated;
        });
        setDisplayedPayments(prev => prev.map(updateFn));
      } else {
        setError(`Payment is still pending. Status: ${result.status}`);
      }
      
      setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    } catch (error) {
      setError(`Failed to verify payment: ${error.message}`);
      console.error('Verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleRefresh = async () => {
    setPage(1);
    if (useMockData) {
      loadMockData();
    } else {
      await fetchInitialPayments();
    }
    setSelectedPayments([]);
  };

  // ✅ FIX: Refresh a single payment by ID from the table's refresh button
  const handleRefreshSingle = async (paymentId) => {
    if (useMockData) return;
    try {
      // Re-fetch full list and update just this payment
      const allData = await getAllPayments();
      const refreshed = allData.find(p => p.id === paymentId);
      if (refreshed) {
        const updateFn = (p) => p.id === paymentId ? refreshed : p;
        setAllPayments(prev => prev.map(updateFn));
        setDisplayedPayments(prev => prev.map(updateFn));
        updateStats(allPayments.map(updateFn));
        setSuccess(`Payment #${paymentId} refreshed`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(`Failed to refresh payment: ${error.message}`);
    }
  };

  const handleBulkVerify = async () => {
    const pendingPayments = displayedPayments.filter(p => p.status === 'pending');
    
    if (pendingPayments.length === 0) {
      setError('No pending payments to verify in current view');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (useMockData) {
      Swal.fire({
        title: 'Mock Bulk Verification',
        text: `Would verify ${pendingPayments.length} pending payments`,
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
      });
      
      const updateFn = (p) => p.status === 'pending'
        ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
        : p;

      setAllPayments(prev => { const u = prev.map(updateFn); updateStats(u); return u; });
      setDisplayedPayments(prev => prev.map(updateFn));
      return;
    }

    try {
      setBulkLoading(true);
      const md5Hashes = pendingPayments
        .filter(p => p.khqr_md5)
        .map(p => p.khqr_md5);
      
      if (md5Hashes.length === 0) {
        setError('No valid BAKONG payments for bulk verification');
        return;
      }

      const results = await verifyBulkPayments(md5Hashes);
      
      if (results.verified && results.verified.length > 0) {
        setSuccess(`Successfully verified ${results.verified.length} payments!`);
        
        const updateFn = (p) => results.verified.includes(p.khqr_md5)
          ? { ...p, status: 'paid', paid_at: new Date().toISOString() }
          : p;

        setAllPayments(prev => { const u = prev.map(updateFn); updateStats(u); return u; });
        setDisplayedPayments(prev => prev.map(updateFn));
      } else {
        setError('No payments were verified');
      }
    } catch (error) {
      setError(`Bulk verification failed: ${error.message}`);
      console.error('Bulk verification error:', error);
    } finally {
      setBulkLoading(false);
      setTimeout(() => { setSuccess(''); setError(''); }, 5000);
    }
  };

  const handlePaymentSelect = (paymentId) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId) ? prev.filter(id => id !== paymentId) : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === displayedPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(displayedPayments.map(p => p.id));
    }
  };

  const handleExportSelected = () => {
    const selectedData = csvData.filter(item => selectedPayments.includes(item['ID']));
    
    if (selectedData.length === 0) {
      setError('No payments selected for export');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const headers = Object.keys(selectedData[0] || {}).join(',');
    const rows = selectedData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_selected_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    setSuccess(`Exported ${selectedData.length} selected payments`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportAll = async () => {
    try {
      if (useMockData || csvData.length > 0) {
        const headers = Object.keys(csvData[0] || {}).join(',');
        const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
        const csv = [headers, ...rows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payments_all_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setSuccess(`Exported ${csvData.length} payments`);
      } else {
        await exportPayments('csv');
        setSuccess('Export started successfully');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to export payments');
      console.error('Export error:', error);
    }
  };

  const runDebugTest = async () => {
    const result = await testAdminPaymentsEndpoint();
    
    if (result.success) {
      Swal.fire({
        title: 'Debug Results',
        html: `
          <div class="text-left">
            <p><strong>Status:</strong> ${result.status}</p>
            <p><strong>Has Payments:</strong> ${result.hasPayments}</p>
            <p><strong>Data Type:</strong> ${typeof result.data}</p>
            <p><strong>Is Array:</strong> ${Array.isArray(result.data) ? 'Yes' : 'No'}</p>
            ${result.data?.payments ? `<p><strong>Payments Count:</strong> ${result.data.payments.length}</p>` : ''}
            ${result.data?.total ? `<p><strong>Total Records:</strong> ${result.data.total}</p>` : ''}
          </div>
        `,
        icon: 'success'
      });
    } else {
      Swal.fire({
        title: 'Debug Failed',
        html: `
          <div class="text-left">
            <p><strong>Status:</strong> ${result.status}</p>
            <p><strong>Message:</strong> ${result.message}</p>
            <p><strong>Data:</strong> ${JSON.stringify(result.data)}</p>
          </div>
        `,
        icon: 'error'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Management</h1>
            <p className="text-gray-600">
              {useMockData 
                ? '🔧 Using mock data - Backend not available' 
                : `📊 Managing ${totalCount} total payments`}
            </p>
            {!loading && (
              <p className="text-sm text-gray-500">
                Showing {displayedPayments.length} of {totalCount} payments
                {filter !== 'all' && ` (filtered by ${filter})`}
              </p>
            )}
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
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <i className={`fas fa-sync-alt mr-2 ${loading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
            
            <button
              onClick={handleBulkVerify}
              disabled={bulkLoading || stats.pending === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {bulkLoading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Verifying...</>
              ) : (
                <><i className="fas fa-check-circle mr-2"></i>
                  Verify Visible Pending ({displayedPayments.filter(p => p.status === 'pending').length})
                </>
              )}
            </button>

            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <i className="fas fa-bug mr-2"></i>Debug
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
              <p><span className="text-gray-400">Total payments (all):</span> {allPayments.length}</p>
              <p><span className="text-gray-400">Displayed payments:</span> {displayedPayments.length}</p>
              <p><span className="text-gray-400">Total count from API:</span> {totalCount}</p>
              <p><span className="text-gray-400">Current page:</span> {page}</p>
              <p><span className="text-gray-400">Has more:</span> {hasMore ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Using mock data:</span> {useMockData ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-400">Selected:</span> {selectedPayments.length}</p>
              <p><span className="text-gray-400">Filter:</span> {filter}</p>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={runDebugTest}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Test Admin Endpoint
                </button>
                <button
                  onClick={() => {
                    console.log('All payments:', allPayments);
                    console.log('Displayed payments:', displayedPayments);
                    alert('Check console for debug info');
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Log to Console
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        <div className="space-y-2">
          {error && <Alert type={useMockData ? "warning" : "error"} message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
          {useMockData && (
            <Alert type="info" message="Using mock data. Backend is not available." onClose={() => {}} />
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
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
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
                <span className="ml-2 text-sm text-gray-500">of {displayedPayments.length} visible</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm flex items-center"
                >
                  <i className="fas fa-download mr-1"></i>Export Selected
                </button>
                <button
                  onClick={() => setSelectedPayments([])}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm flex items-center"
                >
                  <i className="fas fa-times mr-1"></i>Clear Selection
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
              payments={displayedPayments}
              onVerify={handleVerify}           // (verifyIdentifier, paymentMethod)
              onRefresh={handleRefreshSingle}   // (paymentId)
              selectedPayments={selectedPayments}
              onSelectPayment={handlePaymentSelect}
              onSelectAll={handleSelectAll}
              verifying={verifying}
              useMockData={useMockData}
            />
            
            {/* Infinite scroll loader */}
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center items-center py-4 border-t border-gray-200">
                {loadingMore ? (
                  <div className="flex items-center text-gray-500">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Loading more payments...</span>
                  </div>
                ) : (
                  <span className="text-gray-400">Scroll for more</span>
                )}
              </div>
            )}
            
            {!hasMore && displayedPayments.length > 0 && (
              <div className="text-center py-4 border-t border-gray-200 text-gray-500">
                <i className="fas fa-check-circle text-green-500 mr-2"></i>
                You've seen all {totalCount} payments
              </div>
            )}
            
            {displayedPayments.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-receipt text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">No payments found</p>
                {filter !== 'all' && (
                  <button onClick={() => setFilter('all')} className="mt-2 text-blue-600 hover:text-blue-800">
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export & Bulk Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Export & Bulk Actions</h3>
              <p className="text-gray-600 text-sm">
                {useMockData
                  ? 'Export mock data for testing'
                  : `Export ${totalCount} payments data or perform bulk operations`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-flex items-center"
              >
                <i className="fas fa-file-csv mr-2"></i>
                Export All to CSV ({totalCount} records)
              </button>
              
              {useMockData && (
                <button
                  onClick={() => { setUseMockData(false); initializePayments(); }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition inline-flex items-center"
                >
                  <i className="fas fa-sync mr-2"></i>Retry Real Data
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Summary</h4>
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