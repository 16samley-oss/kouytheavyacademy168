import React from 'react';

const Alert = ({ type = 'info', message, onClose }) => {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'fas fa-info-circle'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'fas fa-check-circle'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'fas fa-exclamation-triangle'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'fas fa-exclamation-circle'
    }
  };

  const { bg, border, text, icon } = config[type];

  return (
    <div className={`${bg} border ${border} ${text} px-4 py-3 rounded-lg flex justify-between items-center`}>
      <div className="flex items-center">
        <i className={`${icon} mr-2`}></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;