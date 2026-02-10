import React, { useState } from 'react';
import { downloadBackup } from '../../services/api';

const DashboardBackupButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  const handleQuickBackup = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const result = await downloadBackup(exportFormat);
      
      if (result.success) {
        setMessage(`Backup exported as ${exportFormat.toUpperCase()} successfully!`);
        setShowModal(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
      
    } catch (err) {
      setMessage(`Backup failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { value: 'json', label: 'JSON Format', description: 'Complete database export in JSON format', icon: 'fas fa-file-code' },
    { value: 'csv', label: 'CSV Format', description: 'Spreadsheet-friendly CSV format', icon: 'fas fa-file-csv' },
    { value: 'zip', label: 'ZIP Archive', description: 'Compressed ZIP with all formats', icon: 'fas fa-file-archive' },
  ];

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <i className="fas fa-database mr-2 text-blue-600"></i>
          Quick Backup
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Download a complete backup of your database. Regular backups help protect your data.
        </p>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Backup...
            </>
          ) : (
            <>
              <i className="fas fa-download mr-2"></i>
              Create Database Backup
            </>
          )}
        </button>
        
        {message && (
          <p className={`mt-3 text-sm ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
            <i className={`fas ${message.includes('failed') ? 'fa-times-circle' : 'fa-check-circle'} mr-1`}></i>
            {message}
          </p>
        )}
        
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>
            Last backup: {new Date().toLocaleDateString()} | 
            <a href="/backup" className="text-blue-600 hover:text-blue-800 ml-2">
              Go to full backup panel →
            </a>
          </p>
        </div>
      </div>

      {/* Backup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)}></div>
            </div>

            {/* Modal Content */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <i className="fas fa-database text-blue-600"></i>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Create Database Backup
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Select a format for your backup. We recommend JSON for full database backup.
                      </p>
                      
                      {/* Format Options */}
                      <div className="space-y-3">
                        {formatOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => setExportFormat(option.value)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              exportFormat === option.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${
                                exportFormat === option.value ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <i className={`${option.icon} ${
                                  exportFormat === option.value ? 'text-blue-600' : 'text-gray-600'
                                }`}></i>
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-900">{option.label}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </div>
                              <div className="ml-auto">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  exportFormat === option.value 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {exportFormat === option.value && (
                                    <i className="fas fa-check text-white text-xs"></i>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Backup Info */}
                      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 text-sm mb-1">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Important Information
                        </h4>
                        <ul className="text-yellow-700 text-xs list-disc pl-5 space-y-1">
                          <li>Backup files contain sensitive data - store them securely</li>
                          <li>Backup includes: Users, Courses, Payments, Enrollments, Lessons</li>
                          <li>Restore functionality is available in the full backup panel</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleQuickBackup}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Backup...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download mr-2"></i>
                      Download Backup
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardBackupButton;