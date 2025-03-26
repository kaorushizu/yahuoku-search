import React, { useState, useEffect, useCallback } from 'react';
import { AuctionItem, Statistics } from '../../types';
import FilterWrapper from '../filter/FilterWrapper';
import ResultsContent from './ResultsContent';
import { useFilter } from '../../contexts/FilterContext';
import { useStatistics } from '../../hooks';

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
  availableTags: any[];
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  getProductTags: (title: string) => any[];
  getAuctionUrl: (id: string, endDate: string) => string;
  layout: 'grid' | 'table';
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  setClearPriceRangeFilters?: React.Dispatch<React.SetStateAction<() => void>>;
  setHasPriceRangeFilter?: React.Dispatch<React.SetStateAction<boolean>>;
  loadMore: () => void;
  isLoadingMore: boolean;
  showSelectedOnly: boolean;
  hideSelectedItems: boolean;
  hasPriceRangeFilter: boolean;
  currentPage: number;
  totalPages: number;
  observerTarget?: React.RefObject<HTMLDivElement>;
  onResetSortOrderChange?: (resetFunc: () => void) => void;
}

/**
 * 検索結果コンテナコンポーネント
 * フィルターパネルと結果リストを含む
 */
const ResultsContainer: React.FC<ResultsContainerProps> = ({
  results,
  filteredResults: propFilteredResults,
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
  hideSelectedItems,
  hasPriceRangeFilter,
  currentPage,
  totalPages,
  observerTarget,
  onResetSortOrderChange
}) => {
  // FilterContextから取得
  const {
    togglePriceRangeFilter: contextTogglePriceRange,
    priceRanges
  } = useFilter();
  
  // フィルター済み結果の統計情報を計算
  const filteredStats = useStatistics(propFilteredResults);
  
  // nullチェックを行い、Statistics型に変換
  const currentStatistics: Statistics | undefined = filteredStats ? {
    median: filteredStats.median,
    average: filteredStats.average,
    min: filteredStats.min,
    max: filteredStats.max,
    priceRanges: filteredStats.priceRanges
  } : undefined;

  // 価格範囲で手動フィルタリングした結果
  const [priceFilteredResults, setPriceFilteredResults] = useState<AuctionItem[]>(propFilteredResults);

  // 価格範囲フィルターが変更されたら商品リストを更新
  useEffect(() => {
    if (priceRanges.length > 0) {
      console.log('手動価格フィルター適用:', priceRanges);
      // 価格範囲フィルタリングを適用
      const filtered = propFilteredResults.filter(item => {
        const price = item.落札金額;
        return priceRanges.some(range => 
          price >= range.min && (range.max === Number.MAX_SAFE_INTEGER || price < range.max)
        );
      });
      setPriceFilteredResults(filtered);
      console.log(`フィルター後の商品数: ${filtered.length}/${propFilteredResults.length}`);
    } else {
      // 価格範囲フィルターがない場合は元の結果を使用
      setPriceFilteredResults(propFilteredResults);
    }
  }, [priceRanges, propFilteredResults]);

  // 価格範囲フィルターを適用する関数
  const handleApplyPriceRange = (min: number, max: number, rangeText?: string) => {
    console.log(`Applying price filter: ${min} - ${max}, ${rangeText || `${min}円〜${max}円`}`);
    
    // FilterContextのtogglePriceRangeFilterを呼び出し
    if (contextTogglePriceRange) {
      contextTogglePriceRange(min, max, rangeText || `${min}円〜${max}円`);
    }
    
    // フィルターフラグを設定
    if (setHasPriceRangeFilter) {
      setHasPriceRangeFilter(true);
    }
  };

  // 価格範囲フィルターをクリアする関数
  const handleClearPriceRange = () => {
    console.log('Clearing price filter');
    
    // priceRangesをクリア（手動でフィルターを解除）
    if (priceRanges && priceRanges.length > 0) {
      for (const range of priceRanges) {
        contextTogglePriceRange(range.min, range.max, range.label);
      }
    }
    
    // フィルターフラグをオフにする
    if (setHasPriceRangeFilter) {
      setHasPriceRangeFilter(false);
    }
  };

  // setClearPriceRangeFiltersを更新
  useEffect(() => {
    if (setClearPriceRangeFilters) {
      setClearPriceRangeFilters(() => handleClearPriceRange);
    }
  }, [setClearPriceRangeFilters]);

  // 複数選択のトグル関数
  const handleToggleSelectAll = useCallback(() => {
    toggleSelectAll(priceFilteredResults);
  }, [toggleSelectAll, priceFilteredResults]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* サイドパネル - 左側（固定表示） */}
      <div className="md:col-span-1">
        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pb-4">
          <FilterWrapper
            statistics={statistics}
            currentStatistics={currentStatistics}
            showTags={showTags}
            setShowTags={setShowTags}
            resetAllFilters={resetAllFilters}
            onApplyPriceRange={handleApplyPriceRange}
            onClearPriceRange={handleClearPriceRange}
            hasPriceRangeFilter={hasPriceRangeFilter}
            totalResultsCount={results.length}
            filteredResultsCount={priceFilteredResults.length}
          />
        </div>
      </div>

      {/* 検索結果リスト - 右側（スクロール可能） */}
      <div className="md:col-span-4">
        <ResultsContent
          results={results}
          filteredResults={priceFilteredResults}
          isLoading={isLoading}
          error={error}
          currentSearchKeyword={currentSearchKeyword}
          statistics={statistics}
          totalCount={totalCount}
          selectedItems={selectedItems}
          toggleItemSelection={toggleItemSelection}
          handleRangeSelection={handleRangeSelection}
          toggleSelectAll={handleToggleSelectAll}
          clearSelectedItems={clearSelectedItems}
          getAuctionUrl={getAuctionUrl}
          getProductTags={getProductTags}
          layout={layout}
          setLayout={setLayout}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          showSelectedOnly={showSelectedOnly}
          hideSelectedItems={hideSelectedItems}
          currentPage={currentPage}
          totalPages={totalPages}
          observerTarget={observerTarget}
          onResetSortOrderChange={onResetSortOrderChange}
          onPriceRangeClick={handleApplyPriceRange}
        />
      </div>
    </div>
  );
};

export default ResultsContainer; 