import React, { useRef, useEffect } from 'react';
import Header from '../common/Header';
import ResultsContainer from './ResultsContainer';
import SelectedItemsPanel from '../statistics/SelectedItemsPanel';
import HelpPage from '../HelpPage';
import ScrollToTopButton from '../common/ScrollToTopButton';
import { AuctionItem, FilterOptions, SearchParams, Statistics } from '../../types';
import { ProductTag } from '../../types';

interface ResultsPageProps {
  // 検索関連
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  currentSearchKeyword: string;
  searchHistory: string[];
  results: AuctionItem[];
  filteredResults: AuctionItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  totalCount: number;
  totalPages: number;
  error: string | null;
  isCompanyOnly: boolean;
  setIsCompanyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (e: React.FormEvent, newPage?: number) => void;
  getAuctionUrl: (id: string, endDate: string) => string;
  loadMore: () => void;
  
  // 詳細検索・UI関連
  isAdvancedSearch: boolean;
  setIsAdvancedSearch: React.Dispatch<React.SetStateAction<boolean>>;
  showHelp: boolean;
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
  layout: 'grid' | 'table';
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  
  // フィルター関連
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterKeyword: string;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newFilterKeyword: string;
  setNewFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newExcludeKeyword: string;
  setNewExcludeKeyword: React.Dispatch<React.SetStateAction<string>>;
  showTags: boolean;
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTagFilter: (keyword: string) => void;
  resetAllFilters: () => void;
  availableTags: { tag: ProductTag; count: number }[];
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  getProductTags: (title: string) => ProductTag[];
  setClearPriceRangeFilters: React.Dispatch<React.SetStateAction<() => void>>;
  setHasPriceRangeFilter: React.Dispatch<React.SetStateAction<boolean>>;
  hasPriceRangeFilter: boolean;
  
  // 選択アイテム関連
  selectedItems: Set<string>;
  showSelectedOnly: boolean;
  setShowSelectedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  toggleItemSelection: (id: string) => void;
  clearSelectedItems: () => void;
  handleRangeSelection: (id: string, items: AuctionItem[], isTable: boolean) => void;
  toggleSelectAll: (items: AuctionItem[]) => void;
  
  // 統計情報
  statistics: Statistics;
  selectedStatistics: Statistics;
}

/**
 * 検索結果を表示するページコンポーネント
 * ヘッダー、検索結果一覧、選択アイテムパネルなどを含む
 */
const ResultsPage: React.FC<ResultsPageProps> = ({
  searchParams,
  setSearchParams,
  currentSearchKeyword,
  searchHistory,
  results,
  filteredResults,
  isLoading,
  isLoadingMore,
  totalCount,
  totalPages,
  error,
  isCompanyOnly,
  setIsCompanyOnly,
  handleSearch,
  getAuctionUrl,
  loadMore,
  isAdvancedSearch,
  setIsAdvancedSearch,
  showHelp,
  setShowHelp,
  layout,
  setLayout,
  filterOptions,
  setFilterOptions,
  selectedTags,
  setSelectedTags,
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
  setClearPriceRangeFilters,
  setHasPriceRangeFilter,
  hasPriceRangeFilter,
  selectedItems,
  showSelectedOnly,
  setShowSelectedOnly,
  toggleItemSelection,
  clearSelectedItems,
  handleRangeSelection,
  toggleSelectAll,
  statistics,
  selectedStatistics
}) => {
  // 無限スクロール用のRef
  const observerTarget = useRef<HTMLDivElement>(null);

  // ItemRangeSelection wrapper function
  const handleItemRangeSelection = (id: string) => {
    handleRangeSelection(id, results, false);
  };

  // ToggleSelectAll wrapper
  const handleToggleSelectAll = () => {
    toggleSelectAll(filteredResults);
  };

  // 無限スクロール用のIntersectionObserver
  useEffect(() => {
    // 無限スクロール機能は無効化（ボタンクリックで次のページを読み込む仕様に変更）
    // 以前のIntersectionObserver実装を削除
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダー部分 */}
      <Header 
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        currentSearchKeyword={currentSearchKeyword}
        searchHistory={searchHistory}
        isLoading={isLoading}
        isCompanyOnly={isCompanyOnly}
        setIsCompanyOnly={setIsCompanyOnly}
        handleSearch={handleSearch}
        isAdvancedSearch={isAdvancedSearch}
        setIsAdvancedSearch={setIsAdvancedSearch}
        setShowHelp={setShowHelp}
        layout={layout}
        setLayout={setLayout}
        resultsCount={totalCount}
        filteredResultsCount={filteredResults.length}
        hasResults={results.length > 0}
      />

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="max-w-8xl mx-auto px-4 py-6">
          <div>
            {/* 商品一覧（ResultsContainer） */}
            <ResultsContainer
              results={results}
              filteredResults={filteredResults}
              isLoading={isLoading}
              error={error}
              currentSearchKeyword={searchParams.keyword}
              statistics={statistics}
              totalCount={totalCount}
              selectedItems={selectedItems}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              toggleItemSelection={toggleItemSelection}
              handleRangeSelection={handleItemRangeSelection}
              toggleSelectAll={handleToggleSelectAll}
              clearSelectedItems={clearSelectedItems}
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
              toggleTagFilter={toggleTagFilter}
              resetAllFilters={resetAllFilters}
              availableTags={availableTags}
              addFilterKeyword={addFilterKeyword}
              addExcludeKeyword={addExcludeKeyword}
              getProductTags={getProductTags}
              getAuctionUrl={getAuctionUrl}
              layout={layout}
              setLayout={setLayout}
              setClearPriceRangeFilters={setClearPriceRangeFilters}
              setHasPriceRangeFilter={setHasPriceRangeFilter}
              loadMore={loadMore}
              isLoadingMore={isLoadingMore}
              showSelectedOnly={showSelectedOnly}
              hasPriceRangeFilter={hasPriceRangeFilter}
              currentPage={searchParams.page}
              totalPages={totalPages}
              observerTarget={observerTarget}
            />
          </div>
        </div>
      </main>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />

      {/* 選択商品の統計情報パネル */}
      {selectedItems.size > 0 && selectedStatistics && (
        <SelectedItemsPanel
          selectedStatistics={selectedStatistics}
          selectedItemsCount={selectedItems.size}
          showSelectedOnly={showSelectedOnly}
          setShowSelectedOnly={setShowSelectedOnly}
          clearSelectedItems={clearSelectedItems}
        />
      )}

      {/* ヘルプページ */}
      {showHelp && <HelpPage onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default ResultsPage; 