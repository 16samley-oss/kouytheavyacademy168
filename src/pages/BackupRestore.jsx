import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/Layout/AdminLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getDatabaseInfo, downloadBackup, validateBackupFile, restoreBackup } from '../services/api';

const BackupRestore = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [backupHistory, setBackupHistory] = useState([]);

  useEffect(() => {
    fetchDbInfo();
    loadBackupHistory();
  }, []);

  const fetchDbInfo = async () => {
    try {
      setLoading(true);
      const data = await getDatabaseInfo(); // Changed from api.get() to getDatabaseInfo()
      setDbInfo(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch database info:', err);
      setError('Failed to fetch database information');
    } finally {
      setLoading(false);
    }
  };

  const loadBackupHistory = () => {
    // Mock backup history - in a real app, this would come from API
    const history = [
      { id: 1, name: 'backup_20240115.json', size: '2.4 MB', date: '2024-01-15' },
      { id: 2, name: 'backup_20240108.zip', size: '3.1 MB', date: '2024-01-08' },
      { id: 3, name: 'backup_20240101.csv', size: '1.8 MB', date: '2024-01-01' },
    ];
    setBackupHistory(history);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const result = await downloadBackup(exportFormat);
      
      if (result.success) {
        setMessage(`Backup exported as ${exportFormat.toUpperCase()} successfully!`);
        
        // Add to history
        const newBackup = {
          id: Date.now(),
          name: result.filename,
          size: 'Downloaded',
          date: new Date().toISOString().split('T')[0]
        };
        setBackupHistory([newBackup, ...backupHistory]);
      }
      
    } catch (err) {
      setError(`Export failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      setError('Please select a backup file first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const result = await validateBackupFile(file);
      setValidationResult(result);
      
      if (result.valid) {
        setMessage('Backup file is valid and ready for restoration');
      } else {
        setError(`Invalid backup file: ${result.error}`);
      }
      
    } catch (err) {
      setError(`Validation failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!file) {
      setError('Please select a backup file first');
      return;
    }

    if (!validationResult?.valid) {
      setError('Please validate the backup file first');
      return;
    }

    if (!window.confirm(`Are you sure you want to restore the database? ${clearExisting ? 'This will DELETE all existing data!' : ''}`)) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const result = await restoreBackup(file, clearExisting);
      
      setMessage(`Database restored successfully! ${result.total_records} records imported.`);
      setFile(null);
      setValidationResult(null);
      
      // Refresh database info
      fetchDbInfo();
      
    } catch (err) {
      setError(`Restore failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationResult(null);
    setMessage('');
    setError('');
  };

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: 'fas fa-file-code', color: 'bg-blue-100 text-blue-600' },
    { value: 'csv', label: 'CSV', icon: 'fas fa-file-csv', color: 'bg-green-100 text-green-600' },
    { value: 'zip', label: 'ZIP', icon: 'fas fa-file-archive', color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Database Backup & Restore</h1>
            <p className="text-gray-600">
              Manage your database backups and restore from previous backups
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchDbInfo}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              disabled={loading}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Database Information */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Database Status</h2>
          {dbInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(dbInfo.tables || {}).map(([tableName, tableInfo]) => (
                <div key={tableName} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800 capitalize">{tableName}</h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tableInfo.count} records
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tableInfo.model}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(dbInfo.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-gray-600">Loading database information...</p>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Export Database</h2>
            <p className="text-gray-600 mb-4">Export your complete database in different formats.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Export Format:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExportFormat(option.value)}
                    className={`p-4 rounded-lg border transition-all ${
                      exportFormat === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${option.color}`}>
                      <i className={`${option.icon} text-lg`}></i>
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Export Database as {exportFormat.toUpperCase()}
                </>
              )}
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <i className="fas fa-info-circle mr-1"></i>
                Exports include all tables: Users, Courses, Payments, Enrollments, Lessons, and Progress.
              </p>
            </div>
          </div>

          {/* Import/Restore Section */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Restore Database</h2>
            <p className="text-gray-600 mb-4">Restore your database from a backup file.</p>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Backup File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mx-auto"></i>
                  {file ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".json,.zip,.csv"
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        JSON, CSV, or ZIP files up to 50MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Clear Existing Option */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={clearExisting}
                  onChange={(e) => setClearExisting(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Clear existing data before restore
                </span>
              </label>
              <p className="mt-1 text-sm text-red-600">
                Warning: This will delete ALL current data before restoring!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleValidate}
                disabled={!file || loading}
                className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <i className="fas fa-check-circle mr-2"></i>
                Validate File
              </button>
              <button
                onClick={handleRestore}
                disabled={!validationResult?.valid || loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <i className="fas fa-database mr-2"></i>
                Restore Database
              </button>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-4 p-4 rounded-lg ${validationResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
                <h4 className={`font-semibold mb-2 ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                  <i className={`fas ${validationResult.valid ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                  {validationResult.valid ? 'Valid Backup File' : 'Invalid Backup File'}
                </h4>
                <p className={`text-sm ${validationResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                  Format: {validationResult.format} • 
                  Tables: {validationResult.tables?.length || 0} • 
                  {validationResult.valid ? ' Ready for restore' : ` Error: ${validationResult.error}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Backups</h2>
          {backupHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backupHistory.map((backup) => (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <i className="fas fa-file mr-3 text-gray-400"></i>
                          <span className="text-sm font-medium text-gray-900">{backup.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {backup.name.split('.').pop().toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {backup.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => downloadBackup(backup.name.split('.').pop())}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button 
                          onClick={() => {
                            setBackupHistory(backupHistory.filter(b => b.id !== backup.id));
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-history text-3xl mb-2"></i>
              <p>No backup history found</p>
              <p className="text-sm mt-1">Create your first backup using the export feature above.</p>
            </div>
          )}
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Important Notes & Best Practices
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Before Restoring:</h4>
              <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
                <li>Always create a backup before performing any restore operation</li>
                <li>Test backups on a development environment first</li>
                <li>Schedule regular backups (daily/weekly)</li>
                <li>Store backups securely and off-site</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Security Tips:</h4>
              <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
                <li>Backup files contain sensitive user data - encrypt them</li>
                <li>Limit access to backup files</li>
                <li>Regularly test restore procedures</li>
                <li>Keep multiple backup versions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <i className="fas fa-check-circle mr-2"></i>
            {message}
          </div>
        )}
        
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-gray-700">Processing, please wait...</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BackupRestore;