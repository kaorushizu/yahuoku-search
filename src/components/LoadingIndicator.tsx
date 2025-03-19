import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = '検索中...' }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-500 mb-4"></div>
      <div className="text-gray-600">{message}</div>
    </div>
  );
};

export default LoadingIndicator; 