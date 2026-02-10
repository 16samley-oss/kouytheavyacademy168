import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          
          <div className="hidden md:flex items-center space-x-2">
            <i className="fas fa-graduation-cap text-blue-600"></i>
            <h2 className="text-lg font-semibold text-gray-800">E-Learning Admin</h2>
          </div>
        </div>
        
        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              <i className="fas fa-chevron-down text-gray-500"></i>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 hidden hover:block group-hover:block">
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;