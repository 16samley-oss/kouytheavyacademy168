import React from 'react';

const StatsCard = ({ title, value, icon, color, change, description }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  const changeColor = change?.startsWith('+') ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${changeColor}`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;