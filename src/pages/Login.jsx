import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkBackendHealth } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy ? 'connected' : 'disconnected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    setBackendStatus('checking');
    checkBackendConnection();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-gray-600">Sign in to your admin dashboard</p>
        </div>

        {/* Backend status */}
        <div className={`p-3 rounded-lg ${
          backendStatus === 'connected' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : backendStatus === 'disconnected'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className={`fas fa-${
                backendStatus === 'connected' ? 'check-circle' : 
                backendStatus === 'disconnected' ? 'exclamation-triangle' : 'sync-alt fa-spin'
              } mr-2`}></i>
              <span className="text-sm font-medium">
                {backendStatus === 'connected' && 'Backend connected'}
                {backendStatus === 'disconnected' && 'Backend not connected'}
                {backendStatus === 'checking' && 'Checking backend connection...'}
              </span>
            </div>
            {backendStatus === 'disconnected' && (
              <button
                onClick={handleRetryConnection}
                className="text-sm underline hover:no-underline"
              >
                Retry
              </button>
            )}
          </div>
          {backendStatus === 'disconnected' && (
            <p className="text-xs mt-1">
              Make sure your FastAPI backend is running on http://localhost:8000
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login form */}
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || backendStatus === 'checking'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" light />
                  <span className="ml-2">Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Default credentials: admin / admin123
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The default admin user is created automatically when the backend starts
            </p>
          </div>
        </form>

        {/* Debug information */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Debug Information</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Backend URL:</span>
              <code className="font-mono">http://localhost:8000</code>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${
                backendStatus === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {backendStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Login Endpoint:</span>
              <code className="font-mono">POST /token</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;