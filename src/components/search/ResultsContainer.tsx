import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuctionItem, ProductTag, SortOrder, Statistics } from '../../types';
import ResultsList from './ResultsList';
import StatisticsPanel from '../statistics/StatisticsPanel';
import FilterPanel from '../filter/FilterPanel';
import LoadingIndicator from '../common/LoadingIndicator';
import { useStatistics } from '../../hooks/useStatistics';

// 新しく作成したコンポーネントをインポート
import PaginationControls from './PaginationControls';
import EmptyResults from './EmptyResults';
import ErrorDisplay from './ErrorDisplay';
import PriceRangeFilters from './PriceRangeFilters';

interface ResultsContainerProps {
  results: AuctionItem[];
  filteredResults: AuctionItem[];
  isLoading: boolean;
  error: string | null;
  currentSearchKeyword: string;
  statistics: Statistics;
  totalCount: number;
  selectedItems: Set<string>;
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleItemSelection: (id: string) => void;
  handleRangeSelection: (id: string) => void;
  toggleSelectAll: (items: AuctionItem[]) => void;
  clearSelectedItems: () => void;
  filterOptions: any;
  setFilterOptions: React.Dispatch<React.SetStateAction<any>>;
  filterKeyword: string;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newFilterKeyword: string;
  setNewFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newExcludeKeyword: string;
  setNewExcludeKeyword: React.Dispatch<React.SetStateAction<string>>;
  showTags: boolean;
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTagFilter: (tagKeyword: string) => void;
  resetAllFilters: () => void;
  availableTags: { tag: ProductTag; count: number }[];
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  getProductTags: (title: string) => ProductTag[];
  getAuctionUrl: (id: string, endDate: string) => string;
  layout: 'grid' | 'table';
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  setClearPriceRangeFilters?: React.Dispatch<React.SetStateAction<() => void>>;
  setHasPriceRangeFilter?: React.Dispatch<React.SetStateAction<boolean>>;
  loadMore: () => void;
  isLoadingMore: boolean;
  showSelectedOnly: boolean;
  hasPriceRangeFilter: boolean;
  currentPage: number;
  totalPages: number;
  observerTarget?: React.RefObject<HTMLDivElement>;
}

interface PriceRange {
  min: number;
  max: number;
  range: string;
}

/**
 * 検索結果コンテナコンポーネント
 * 検索結果の表示、フィルタリング、統計情報表示を管理します
 */
const ResultsContainer: React.FC<ResultsContainerProps> = ({
  results,
  filteredResults,
  isLoading,
  error,
  currentSearchKeyword,
  statistics,
  totalCount,
  selectedItems,
  selectedTags,
  setSelectedTags,
  toggleItemSelection,
  handleRangeSelection,
  toggleSelectAll,
  clearSelectedItems,
  filterOptions,
  setFilterOptions,
  filterKeyword,
  setFilterKeyword,
  newFilterKeyword,
  setNewFilterKeyword,
  newExcludeKeyword,
  setNewExcludeKeyword,
  showTags,
  setShowTags,
  toggleTagFilter,
  resetAllFilters,
  availableTags,
  addFilterKeyword,
  addExcludeKeyword,
  getProductTags,
  getAuctionUrl,
  layout,
  setLayout,
  setClearPriceRangeFilters,
  setHasPriceRangeFilter,
  loadMore,
  isLoadingMore,
  showSelectedOnly,
  hasPriceRangeFilter,
  currentPage,
  totalPages,
  observerTarget
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isTagsVisible, setIsTagsVisible] = useState(true);
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);

  // 価格範囲フィルター機能
  const handlePriceRangeClick = (rangeStart: number, rangeEnd: number, rangeText: string) => {
    // 同じ範囲がすでに選択されているか確認
    const isAlreadySelected = selectedPriceRanges.some(
      range => range.min === rangeStart && range.max === rangeEnd
    );

    if (isAlreadySelected) {
      // 同じ範囲をクリックした場合はその範囲のみを削除
      const newRanges = selectedPriceRanges.filter(
        range => !(range.min === rangeStart && range.max === rangeEnd)
      );
      setSelectedPriceRanges(newRanges);
      
      // 親コンポーネントに通知
      if (setHasPriceRangeFilter) {
        setHasPriceRangeFilter(newRanges.length > 0);
      }
    } else {
      // 新しい価格範囲を追加
      const newRange: PriceRange = {
        min: rangeStart,
        max: rangeEnd,
        range: rangeText
      };
      const newRanges = [...selectedPriceRanges, newRange];
      setSelectedPriceRanges(newRanges);
      
      // 親コンポーネントに通知
      if (setHasPriceRangeFilter) {
        setHasPriceRangeFilter(true);
      }
    }
  };

  // 価格範囲でフィルタリングされた結果
  const priceFilteredResults = selectedPriceRanges.length > 0
    ? filteredResults.filter(item => {
        const price = item.落札金額;
        // いずれかの選択された価格範囲に該当する場合はtrue
        return selectedPriceRanges.some(range => {
          return price >= range.min && 
                (range.max === Number.MAX_SAFE_INTEGER ? true : price < range.max);
        });
      })
    : filteredResults;
  
  // ソート処理を追加
  const sortedResults = useMemo(() => {
    if (sortOrder === 'none') {
      return priceFilteredResults;
    }
    
    return [...priceFilteredResults].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.落札金額 - b.落札金額;
      } else {
        return b.落札金額 - a.落札金額;
      }
    });
  }, [priceFilteredResults, sortOrder]);

  // 現在表示されている結果に対して全選択を処理する関数
  const handleToggleSelectAll = useCallback(() => {
    toggleSelectAll(sortedResults);
  }, [toggleSelectAll, sortedResults]);

  // 現在表示されているアイテムの統計情報を計算
  const currentStatistics = useStatistics(sortedResults);

  // 価格範囲フィルターをクリア
  const clearAllPriceRangeFilters = () => {
    setSelectedPriceRanges([]);
    
    // 親コンポーネントに通知
    if (setHasPriceRangeFilter) {
      setHasPriceRangeFilter(false);
    }
  };
  
  // 親コンポーネントにクリア関数を渡す
  useEffect(() => {
    if (setClearPriceRangeFilters) {
      setClearPriceRangeFilters(() => clearAllPriceRangeFilters);
    }
  }, [setClearPriceRangeFilters]);

  // フィルターが適用されているかどうかをチェックする関数
  const hasAnyFilter = useCallback(() => {
    return selectedPriceRanges.length > 0 || 
           selectedTags.size > 0 || 
           filterOptions.filterKeywords.length > 0 || 
           filterOptions.excludeKeywords.length > 0 || 
           filterOptions.excludeJunk || 
           filterOptions.excludeMultipleBids || 
           filterOptions.excludeNew || 
           filterOptions.excludeSets || 
           filterOptions.excludeFreeShipping ||
           showSelectedOnly;
  }, [
    selectedPriceRanges.length,
    selectedTags.size,
    filterOptions,
    showSelectedOnly
  ]);

  // 検索中のローディング表示
  if (isLoading && results.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
        <LoadingIndicator size="large" />
      </div>
    );
  }

  // エラーメッセージの表示
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // 検索結果がない場合
  if (!isLoading && results.length === 0 && currentSearchKeyword) {
    return <EmptyResults keyword={currentSearchKeyword} />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-[1700px] mx-auto">
      {/* サイドパネル（モバイルでは固定） */}
      <div className="md:col-span-1">
        <div className="space-y-4 sticky top-20">
          {results.length > 0 && (
            <FilterPanel
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              filterKeyword={filterKeyword}
              setFilterKeyword={setFilterKeyword}
              newFilterKeyword={newFilterKeyword}
              setNewFilterKeyword={setNewFilterKeyword}
              newExcludeKeyword={newExcludeKeyword}
              setNewExcludeKeyword={setNewExcludeKeyword}
              showTags={showTags}
              setShowTags={setShowTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              toggleTagFilter={toggleTagFilter}
              resetAllFilters={() => {
                resetAllFilters();
                clearAllPriceRangeFilters();
              }}
              availableTags={availableTags}
              addFilterKeyword={addFilterKeyword}
              addExcludeKeyword={addExcludeKeyword}
              isTagsVisible={isTagsVisible}
              setIsTagsVisible={setIsTagsVisible}
              resultsCount={results.length}
              filteredResultsCount={filteredResults.length}
            />
          )}

          {/* 統計情報パネル (サイドバー) */}
          {results.length > 0 && statistics && (
            <StatisticsPanel
              statistics={statistics}
              currentStatistics={currentStatistics}
              isCompact={true}
              isVisible={isStatsVisible}
              onToggleVisibility={() => setIsStatsVisible(!isStatsVisible)}
              onPriceRangeClick={handlePriceRangeClick}
              selectedPriceRanges={selectedPriceRanges}
              hasActiveFilters={hasAnyFilter()}
              hasActivePriceFilters={selectedPriceRanges.length > 0}
              onClearAllPriceRanges={clearAllPriceRangeFilters}
            />
          )}
          
          {/* 価格範囲フィルター表示 */}
          <PriceRangeFilters
            selectedPriceRanges={selectedPriceRanges}
            setSelectedPriceRanges={setSelectedPriceRanges}
            clearAllPriceRangeFilters={clearAllPriceRangeFilters}
            filteredResultsCount={priceFilteredResults.length}
            totalResultsCount={filteredResults.length}
          />
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="md:col-span-4">
        {results.length > 0 && (
          <div className="space-y-4">
            {/* 統計情報パネル (デスクトップ) */}
            {statistics && (
              <StatisticsPanel 
                statistics={statistics}
                currentStatistics={currentStatistics}
                onPriceRangeClick={handlePriceRangeClick}
                selectedPriceRanges={selectedPriceRanges}
                hasActiveFilters={hasAnyFilter()}
                hasActivePriceFilters={selectedPriceRanges.length > 0}
                onClearAllPriceRanges={clearAllPriceRangeFilters}
              />
            )}

            {/* 検索結果リスト */}
            <ResultsList
              filteredResults={sortedResults}
              layout={layout}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              selectedItems={selectedItems}
              toggleItemSelection={toggleItemSelection}
              handleRangeSelection={handleRangeSelection}
              getProductTags={getProductTags}
              getAuctionUrl={getAuctionUrl}
              setLayout={setLayout}
              toggleSelectAll={handleToggleSelectAll}
            />

            {/* ページネーションコントロール */}
            {results.length > 0 && !isLoading && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                loadMore={loadMore}
                observerTarget={observerTarget}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsContainer; 