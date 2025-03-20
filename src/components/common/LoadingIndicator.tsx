import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

/**
 * ローディング中を表示するインジケーターコンポーネント
 * 
 * @param size - インジケーターのサイズ (small, medium, large)
 * @param text - 表示するテキスト
 * @param className - 追加のクラス名
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium', 
  text = '読み込み中...',
  className = '' 
}) => {
  // サイズに基づいてスタイルを設定
  const sizeMap = {
    small: {
      spinner: 'h-4 w-4 border-2',
      text: 'text-xs'
    },
    medium: {
      spinner: 'h-6 w-6 border-2',
      text: 'text-sm'
    },
    large: {
      spinner: 'h-10 w-10 border-4',
      text: 'text-base'
    }
  };

  const spinnerStyles = sizeMap[size].spinner;
  const textStyles = sizeMap[size].text;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerStyles} border-blue-100 border-t-blue-500 mb-2`}></div>
      {text && <div className={`text-gray-600 ${textStyles}`}>{text}</div>}
    </div>
  );
};

export default LoadingIndicator; 