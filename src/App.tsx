import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearch } from './contexts/SearchContext';
import { useFilter } from './contexts/FilterContext';
import { useSelection } from './contexts/SelectionContext';
import { useStatistics } from './hooks';

// 新しく作成したコンポーネントをインポート
import SearchPage from './components/search/SearchPage';
import ResultsPage from './components/search/ResultsPage';

function App() {
  // コンテキストからフックを使用
  const {
    searchParams,
    setSearchParams,
    currentSearchKeyword,
    searchHistory,
    results,
    isLoading,
    isLoadingMore,
    totalPages,
    totalCount,
    error,
    isCompanyOnly,
    setIsCompanyOnly,
    handleSearch,
    loadMore: originalLoadMore,
    getAuctionUrl
  } = useSearch();
  
  const {
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
    filteredResults,
    setClearPriceRangeFilters,
    setHasPriceRangeFilter,
    hasPriceRangeFilter
  } = useFilter();
  
  const {
    selectedItems,
    showSelectedOnly,
    setShowSelectedOnly,
    toggleItemSelection,
    clearSelectedItems,
    handleRangeSelection,
    toggleSelectAll,
    selectedStatistics
  } = useSelection();
  
  // UI関連の状態
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  
  // Refs
  const observerTarget = useRef<HTMLDivElement>(null);

  // filteredResultsの統計情報を計算
  const statistics = useStatistics(filteredResults);

  // コンテキスト間の連携を行うloadMore関数
  const loadMore = useCallback(() => {
    console.log('Loading more items with filters:', filterOptions);
    console.log('Show selected only:', showSelectedOnly);
    originalLoadMore(filterOptions, showSelectedOnly);
  }, [originalLoadMore, filterOptions, showSelectedOnly]);

  // Ctrl+Sで検索ボックスにフォーカスするショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // ブラウザの保存ダイアログを防止
        // document内のすべての検索入力フィールドを探して最初のものにフォーカス
        const searchInput = document.querySelector('input[type="text"][inputmode="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select(); // テキストを全選択
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAddFilterKeyword = () => {
    if (newFilterKeyword.trim()) {
      addFilterKeyword(newFilterKeyword.trim());
    }
  };

  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword.trim()) {
      addExcludeKeyword(newExcludeKeyword.trim());
    }
  };

  // デフォルトの統計情報
  const defaultStats = {
    median: 0,
    average: 0,
    min: 0,
    max: 0,
    priceRanges: []
  };

  // フィルターが適用されているかを確認する関数
  const hasFilters = useCallback(() => {
    return selectedTags.size > 0 || 
      filterOptions.filterKeywords.length > 0 || 
      filterOptions.excludeKeywords.length > 0 || 
      filterOptions.excludeJunk || 
      filterOptions.excludeMultipleBids || 
      filterOptions.excludeNew || 
      filterOptions.excludeSets || 
      filterOptions.excludeFreeShipping ||
      showSelectedOnly ||
      hasPriceRangeFilter;
  }, [
    selectedTags, 
    filterOptions, 
    showSelectedOnly, 
    hasPriceRangeFilter
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 初期画面：検索フォーム */}
      {results.length === 0 && !currentSearchKeyword ? (
        <SearchPage 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          searchHistory={searchHistory}
          isLoading={isLoading}
          isCompanyOnly={isCompanyOnly}
          setIsCompanyOnly={setIsCompanyOnly}
          isAdvancedSearch={isAdvancedSearch}
          setIsAdvancedSearch={setIsAdvancedSearch}
          handleSearch={handleSearch}
        />
      ) : (
        <ResultsPage 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          currentSearchKeyword={currentSearchKeyword}
          searchHistory={searchHistory}
          results={results}
          filteredResults={filteredResults}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          totalCount={totalCount}
          totalPages={totalPages}
          error={error}
          isCompanyOnly={isCompanyOnly}
          setIsCompanyOnly={setIsCompanyOnly}
          handleSearch={handleSearch}
          getAuctionUrl={getAuctionUrl}
          loadMore={loadMore}
          isAdvancedSearch={isAdvancedSearch}
          setIsAdvancedSearch={setIsAdvancedSearch}
          showHelp={showHelp}
          setShowHelp={setShowHelp}
          layout={layout}
          setLayout={setLayout}
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
          addFilterKeyword={handleAddFilterKeyword}
          addExcludeKeyword={handleAddExcludeKeyword}
          getProductTags={getProductTags}
          setClearPriceRangeFilters={setClearPriceRangeFilters}
          setHasPriceRangeFilter={setHasPriceRangeFilter}
          hasPriceRangeFilter={hasPriceRangeFilter}
          selectedItems={selectedItems}
          showSelectedOnly={showSelectedOnly}
          setShowSelectedOnly={setShowSelectedOnly}
          toggleItemSelection={toggleItemSelection}
          clearSelectedItems={clearSelectedItems}
          handleRangeSelection={handleRangeSelection}
          toggleSelectAll={toggleSelectAll}
          statistics={statistics || defaultStats}
          selectedStatistics={selectedStatistics || defaultStats}
          hasFilters={hasFilters()}
        />
      )}
    </div>
  );
}

export default App;