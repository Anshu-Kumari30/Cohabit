import React from 'react';

const SkeletonCard = ({ type = 'expense' }) => {
  const base = 'bg-white rounded-air shadow-air-sm p-6 animate-pulse';

  if (type === 'expense') {
    return (
      <div className={base}>
        <div className="flex justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          </div>
          <div className="h-8 bg-gray-100 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (type === 'chore') {
    return (
      <div className={base}>
        <div className="flex items-start space-x-3">
          <div className="h-6 w-6 bg-gray-100 rounded"></div>
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-100 rounded w-2/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            <div className="h-4 bg-gray-100 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={base}>
      <div className="space-y-3">
        <div className="h-5 bg-gray-100 rounded w-1/3"></div>
        <div className="h-8 bg-gray-100 rounded w-full"></div>
        <div className="h-8 bg-gray-100 rounded w-full"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
