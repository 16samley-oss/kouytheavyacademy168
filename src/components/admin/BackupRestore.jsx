import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BackupRestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [dbInfo, setDbInfo] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Get database info
  const fetchDbInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/backup/info');
      setDbInfo(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch database info');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Export backup
  const handleExport = async (format) => {
    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const endpoint = `/admin/backup/export/${format}`;
      
      // Create a hidden link to trigger download
      const link = document.createElement('a');
      link.href = `${api.defaults.baseURL}${endpoint}`;
      link.setAttribute('download', '');
      
      // Add authorization header
      const token = localStorage.getItem('access_token');
      if (token) {
        link.setAttribute('Authorization', `Bearer ${token}`);
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage(`Backup exported as ${format.toUpperCase()}`);
      
    } catch (err) {
      setError(`Export failed: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Validate backup file
  const handleValidate = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/admin/backup/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setValidationResult(response.data);
      
      if (response.data.valid) {
        setMessage('Backup file is valid and ready for restoration');
      } else {
        setError(`Invalid backup file: ${response.data.error}`);
      }
      
    } catch (err) {
      setError(`Validation failed: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Restore from backup
  const handleRestore = async () => {
    if (!file) {
      setError('Please select a file first');
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
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clear_existing', clearExisting.toString());
      
      const response = await api.post('/admin/backup/restore', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setMessage(`Database restored successfully! ${response.data.total_records} records imported.`);
      setFile(null);
      setValidationResult(null);
      
      // Refresh database info
      fetchDbInfo();
      
    } catch (err) {
      setError(`Restore failed: ${err.response?.data?.detail || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationResult(null);
    setMessage('');
    setError('');
  };

  // Load database info on component mount
  React.useEffect(() => {
    fetchDbInfo();
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Database Backup & Restore</h2>
        <p className="text-gray-600 mb-6">
          Backup your database or restore from a previous backup. Be careful when restoring as it can overwrite existing data.
        </p>
      </div>

      {/* Database Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Database Status</h3>
        {dbInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(dbInfo.tables || {}).map(([tableName, tableInfo]) => (
              <div key={tableName} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 capitalize">{tableName}</h4>
                <p className="text-gray-600">Records: {tableInfo.count}</p>
                <p className="text-sm text-gray-500">{tableInfo.model}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={fetchDbInfo}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          disabled={loading}
        >
          Refresh Info
        </button>
      </div>

      {/* Export Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Export Database</h3>
        <p className="text-gray-600 mb-4">Export your database in different formats:</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleExport('json')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <i className="fas fa-file-export mr-2"></i>
            Export as JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <i className="fas fa-file-csv mr-2"></i>
            Export as CSV
          </button>
          <button
            onClick={() => handleExport('zip')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <i className="fas fa-file-archive mr-2"></i>
            Export as ZIP
          </button>
        </div>
      </div>

      {/* Import/Restore Section */}
      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Restore Database</h3>
        <p className="text-gray-600 mb-4">Restore your database from a backup file:</p>
        
        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Backup File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".json,.zip,.csv"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>

        {/* Clear Existing Option */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={clearExisting}
              onChange={(e) => setClearExisting(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Clear existing data before restore (DANGEROUS!)
            </span>
          </label>
          <p className="mt-1 text-sm text-red-600">
            Warning: This will delete all current data before restoring!
          </p>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <div className={`mb-6 p-4 rounded-lg ${validationResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <h4 className="font-semibold mb-2">
              {validationResult.valid ? '✓ Valid Backup File' : '✗ Invalid Backup File'}
            </h4>
            <p>Format: {validationResult.format}</p>
            <p>Tables: {validationResult.tables?.length || 0}</p>
            {validationResult.metadata && (
              <p>Exported: {validationResult.metadata.timestamp}</p>
            )}
            {validationResult.error && (
              <p className="mt-2 font-semibold">Error: {validationResult.error}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleValidate}
            disabled={!file || loading}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
          >
            <i className="fas fa-check-circle mr-2"></i>
            Validate File
          </button>
          <button
            onClick={handleRestore}
            disabled={!validationResult?.valid || loading}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <i className="fas fa-database mr-2"></i>
            Restore Database
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-lg">
            <i className="fas fa-check-circle mr-2"></i>
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-lg">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Important Notes
        </h4>
        <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
          <li>Always backup your data before performing a restore</li>
          <li>Restoring will overwrite existing data if "Clear existing data" is checked</li>
          <li>Backup files contain sensitive information - store them securely</li>
          <li>The system will automatically handle data relationships and foreign keys</li>
          <li>Restore process may take several minutes for large databases</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupRestore;