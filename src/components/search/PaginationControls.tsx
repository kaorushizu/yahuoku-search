import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  observerTarget?: React.RefObject<HTMLDivElement>;
}

/**
 * ページネーションコントロールコンポーネント
 * 「次のページを読み込む」ボタンを提供します
 */
const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  isLoading,
  isLoadingMore,
  loadMore,
  observerTarget
}) => {
  // 表示すべきかの確認
  const shouldDisplay = !isLoading && currentPage < totalPages;
  if (!shouldDisplay) return null;

  return (
    <div ref={observerTarget} className="mt-4 mb-8">
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
          <span>次のページを読み込む（{currentPage}/{totalPages}）</span>
        )}
      </button>
    </div>
  );
};

export default PaginationControls; 