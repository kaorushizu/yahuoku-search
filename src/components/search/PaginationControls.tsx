import React from 'react';
import { FilterOptions } from '../../types';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  hasFilters: boolean;
  observerTarget?: React.RefObject<HTMLDivElement>;
}

/**
 * ページネーションコントロールコンポーネント
 * 「もっと読み込む」ボタンや無限スクロール用のローディングインジケーターを含む
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  isLoading,
  isLoadingMore,
  loadMore,
  hasFilters,
  observerTarget
}) => {
  // 表示すべきかの確認
  const shouldDisplay = !isLoading && currentPage < totalPages;
  if (!shouldDisplay) return null;

  // フィルターが適用されている場合は明示的なボタンを表示
  if (hasFilters) {
    return (
      <div className="mt-4 mb-8">
        <button 
          onClick={loadMore}
          disabled={isLoadingMore}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow p-4 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoadingMore ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>読み込み中...</span>
            </>
          ) : (
            <span>次のページを読み込む</span>
          )}
        </button>
      </div>
    );
  }

  // フィルターが適用されていない場合は無限スクロール用のローディングインジケーター
  return (
    <div ref={observerTarget} className="mt-4 mb-8">
      <button 
        onClick={loadMore}
        disabled={isLoadingMore}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow p-4 transition-colors duration-200 flex items-center justify-center gap-3"
      >
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        <span>次のページを読み込み中...</span>
      </button>
    </div>
  );
};

export default PaginationControls; 