import React from 'react';

const LoadingSpinner = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClass = light ? 'border-white' : 'border-blue-500';

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${colorClass} border-2 border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;