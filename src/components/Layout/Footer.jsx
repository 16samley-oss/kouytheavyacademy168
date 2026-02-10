import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-600">
            © {currentYear} E-Learning Platform. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Help Center
          </a>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">v1.0.0</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;