import React, { useState, useRef } from 'react';
import { AuctionItem, ProductTag, SortOrder, Statistics } from '../../types';
import ResultsList from './ResultsList';
import StatisticsPanel from '../statistics/StatisticsPanel';
import FilterPanel from '../filter/FilterPanel';
import LoadingIndicator from '../common/LoadingIndicator';

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
  toggleSelectAll: () => void;
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
  getAuctionUrl
}) => {
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isTagsVisible, setIsTagsVisible] = useState(true);
  const [isStatsVisible, setIsStatsVisible] = useState(true);

  // エラーメッセージの表示
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
        {error}
      </div>
    );
  }

  // 検索中のローディング表示
  if (isLoading && results.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
        <LoadingIndicator size="large" />
        <div className="text-gray-600 mt-4">検索中...</div>
      </div>
    );
  }

  // 検索結果がない場合
  if (results.length === 0 && currentSearchKeyword) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
        <div className="text-gray-500 text-center">
          <div className="mb-2 text-lg font-medium">検索結果が見つかりませんでした</div>
          <div className="text-sm">検索条件を変更して、もう一度お試しください</div>
        </div>
      </div>
    );
  }

  // 検索実行前の初期表示
  if (results.length === 0 && !currentSearchKeyword) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
        <div className="text-gray-500 text-center">
          <div className="mb-2 text-lg font-medium">商品を検索してください</div>
          <div className="text-sm">過去の落札価格をチェックして、適正価格を把握できます</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* サイドパネル */}
      <div className="md:col-span-1">
        <div className="md:sticky md:top-[calc(3.5rem+1px+1rem)] space-y-4 max-h-[calc(100vh-3.5rem-1px-2rem)] overflow-y-auto">
          {/* フィルターパネル */}
          {results.length > 0 && (
            <FilterPanel
              filterOptions={filterOptions}
              setFilterOptions={setFilterOptions}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              filterKeyword={filterKeyword}
              setFilterKeyword={setFilterKeyword}
              newFilterKeyword={newFilterKeyword}
              setNewFilterKeyword={setNewFilterKeyword}
              newExcludeKeyword={newExcludeKeyword}
              setNewExcludeKeyword={setNewExcludeKeyword}
              showTags={showTags}
              setShowTags={setShowTags}
              toggleTagFilter={toggleTagFilter}
              resetAllFilters={resetAllFilters}
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
              isCompact={true}
              isVisible={isStatsVisible}
              onToggleVisibility={() => setIsStatsVisible(!isStatsVisible)}
            />
          )}
        </div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="md:col-span-4">
        {results.length > 0 && (
          <div className="space-y-4">
            {/* 統計情報パネル (デスクトップ) */}
            {statistics && (
              <StatisticsPanel statistics={statistics} />
            )}

            {/* 検索結果リスト */}
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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsContainer; 