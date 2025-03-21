import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

/**
 * エラーメッセージを表示するコンポーネント
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
      <div className="font-medium mb-1">エラーが発生しました</div>
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default ErrorDisplay; 