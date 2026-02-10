import React from 'react';

const Card = ({ children, className = '', title, subtitle, actions, hover = false }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}
    >
      {(title || actions) && (
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;