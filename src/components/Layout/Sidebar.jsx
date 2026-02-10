import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/courses', icon: 'fas fa-book', label: 'Courses' },
    { path: '/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/payments', icon: 'fas fa-credit-card', label: 'Payments' },
    { path: '/enrollments', icon: 'fas fa-graduation-cap', label: 'Enrollments' },
    { path: '/backup', icon: 'fas fa-database', label: 'Backup & Restore' }, // Add this line
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <h1 className="text-xl font-bold">E-Learning Admin</h1>
        </div>
        
        <div className="px-4 py-6">
          {/* User info */}
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-700 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <i className="fas fa-user text-white"></i>
            </div>
            <div>
              <p className="font-medium">{user?.full_name || 'Admin'}</p>
              <p className="text-sm text-gray-300">{user?.email}</p>
            </div>
          </div>
          
          {/* Menu items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`
                }
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;