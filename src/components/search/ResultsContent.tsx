import React, { useState, useCallback, useEffect } from 'react';
import { AuctionItem, Statistics, SortOrder } from '../../types';
import ResultsList from './ResultsList';
import StatisticsPanel from '../statistics/StatisticsPanel';
import EmptyResults from './EmptyResults';
import ErrorDisplay from './ErrorDisplay';
import PaginationControls from './PaginationControls';
import LoadingIndicator from '../common/LoadingIndicator';
import { useFilter } from '../../contexts/FilterContext';

// 価格範囲の型定義
interface PriceRange {
  min: number;
  max: number;
  range: string;
}

interface ResultsContentProps {
  results: AuctionItem[];
  filteredResults: AuctionItem[];
  isLoading: boolean;
  error: string | null;
  currentSearchKeyword: string;
  statistics: Statistics;
  currentStatistics?: Statistics;
  totalCount: number;
  selectedItems: Set<string>;
  toggleItemSelection: (id: string) => void;
  handleRangeSelection: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelectedItems: () => void;
  getAuctionUrl: (id: string, endDate: string) => string;
  getProductTags: (title: string) => any[]; // ProductTag[]
  layout: 'grid' | 'table';
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  isLoadingMore: boolean;
  loadMore: () => void;
  showSelectedOnly: boolean;
  hideSelectedItems: boolean;
  currentPage: number;
  totalPages: number;
  observerTarget?: React.RefObject<HTMLDivElement>;
  onResetSortOrderChange?: (resetFunc: () => void) => void;
  onPriceRangeClick?: (rangeStart: number, rangeEnd: number, rangeText: string) => void;
}

/**
 * 検索結果コンテンツコンポーネント
 * 結果リスト、統計パネル、ページネーションなどを表示
 */
const ResultsContent: React.FC<ResultsContentProps> = ({
  results,
  filteredResults,
  isLoading,
  error,
  currentSearchKeyword,
  statistics,
  currentStatistics,
  totalCount,
  selectedItems,
  toggleItemSelection,
  handleRangeSelection,
  toggleSelectAll,
  clearSelectedItems,
  getAuctionUrl,
  getProductTags,
  layout,
  setLayout,
  isLoadingMore,
  loadMore,
  showSelectedOnly,
  hideSelectedItems,
  currentPage,
  totalPages,
  observerTarget,
  onResetSortOrderChange,
  onPriceRangeClick
}) => {
  // FilterContextから直接取得
  const { 
    priceRanges,
    togglePriceRangeFilter,
    clearPriceRangeFilters
  } = useFilter();
  
  // ソート状態
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // ソート状態が変更されたときにコンソールログを出力（デバッグ用）
  useEffect(() => {
    console.log(`Sort order changed to: ${sortOrder}`);
  }, [sortOrder]);

  // ソートリセット関数
  const resetSortOrder = useCallback(() => {
    setSortOrder('none');
  }, []);

  // コンポーネントがマウントされた時にリセット関数を親に渡す
  React.useEffect(() => {
    if (onResetSortOrderChange) {
      onResetSortOrderChange(resetSortOrder);
    }
  }, [resetSortOrder, onResetSortOrderChange]);

  // 統計パネルの価格範囲クリック処理
  const handlePriceRangeClick = useCallback((rangeStart: number, rangeEnd: number, rangeText: string) => {
    console.log(`ResultsContent: Price range clicked ${rangeStart}-${rangeEnd} (${rangeText})`);
    
    // コンテキストの関数を直接呼び出す
    togglePriceRangeFilter(rangeStart, rangeEnd, rangeText);

    // 親コンポーネントに渡された関数も呼び出す
    if (onPriceRangeClick) {
      onPriceRangeClick(rangeStart, rangeEnd, rangeText);
    }
  }, [onPriceRangeClick, togglePriceRangeFilter]);

  // 価格範囲フィルターをクリアする処理
  const handleClearPriceRanges = useCallback(() => {
    clearPriceRangeFilters();
  }, [clearPriceRangeFilters]);

  // エラーが発生している場合
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // ローディング中の表示
  if (isLoading && filteredResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingIndicator text="検索結果を読み込み中..." size="large" className="mt-8" />
      </div>
    );
  }

  // 検索結果がない場合
  if (!isLoading && filteredResults.length === 0) {
    // 絞り込み結果が0件の場合（全体の結果はある）
    if (results.length > 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">フィルター条件に一致する商品がありません</p>
          <button
            onClick={clearSelectedItems}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            フィルターをクリア
          </button>
        </div>
      );
    }
    
    // 検索結果自体がない場合
    return <EmptyResults keyword={currentSearchKeyword} />;
  }

  // 統計情報オブジェクトの作成
  const listStatistics = {
    medianPrice: statistics.median
  };

  // 価格範囲をStatisticsPanel形式に変換
  const convertedPriceRanges = priceRanges.map(range => ({
    min: range.min,
    max: range.max,
    range: range.label
  }));

  return (
    <div className="results-content mb-8">
      {/* 統計情報パネル */}
      <div className="mb-6">
        {!isLoading && filteredResults.length > 0 && (
          <div className="relative">
            <StatisticsPanel 
              statistics={currentStatistics || statistics}
              onPriceRangeClick={handlePriceRangeClick}
              selectedPriceRanges={convertedPriceRanges}
              hasActiveFilters={priceRanges.length > 0}
              hasActivePriceFilters={priceRanges.length > 0}
            />
            
            {/* 価格範囲クリアボタン - フィルターがある場合のみ表示 */}
            {priceRanges.length > 0 && (
              <div className="absolute top-0 right-0 p-2">
                <button
                  onClick={handleClearPriceRanges}
                  className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                >
                  価格範囲をクリア
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 検索結果一覧 */}
      <ResultsList
        filteredResults={filteredResults}
        layout={layout}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedItems={selectedItems}
        toggleItemSelection={toggleItemSelection}
        handleRangeSelection={handleRangeSelection}
        getProductTags={getProductTags}
        getAuctionUrl={getAuctionUrl}
        setLayout={setLayout}
        toggleSelectAll={toggleSelectAll}
        statistics={listStatistics}
        showSelectedOnly={showSelectedOnly}
        hideSelectedItems={hideSelectedItems}
        totalCount={totalCount}
        results={results}
      />
      
      {/* ページネーションコントロール */}
      {!isLoading && filteredResults.length > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          loadMore={loadMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
          observerTarget={observerTarget}
        />
      )}
      
      {/* 無限スクロール用のターゲット要素（別途に配置する場合） */}
      {!observerTarget && <div className="h-4" />}
    </div>
  );
};

export default ResultsContent; 