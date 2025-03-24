import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useSearch } from './contexts/SearchContext';
import { useFilter } from './contexts/FilterContext';
import { useSelection } from './contexts/SelectionContext';
import { useStatistics } from './hooks';

// 新しく作成したコンポーネントをインポート
import SearchPage from './components/search/SearchPage';
import ResultsPage from './components/search/ResultsPage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    handleSearch: originalHandleSearch,
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
    selectedStatistics,
    hideSelectedItems,
    setHideSelectedItems,
  } = useSelection();
  
  // UI関連の状態
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  
  // Refs
  const observerTarget = useRef<HTMLDivElement>(null);

  // filteredResultsの統計情報を計算
  const statistics = useStatistics(filteredResults);

  // URLからクエリパラメータを取得して検索を実行する
  useEffect(() => {
    // 検索中や結果読み込み中は処理をスキップ
    if (isLoading) return;

    // URLからクエリパラメータを解析
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword');
    
    // クエリパラメータにキーワードがあり、現在の検索キーワードと異なる場合は検索を実行
    if (keyword && keyword !== currentSearchKeyword) {
      // URL変更によるフラグを立てる
      const isFromUrlChange = true;
      
      setSearchParams(prev => ({ ...prev, keyword }));
      
      // フォームイベントをシミュレートして検索実行
      const event = new Event('submit') as unknown as React.FormEvent;
      originalHandleSearch(event);
    }
  }, [location.search, currentSearchKeyword, setSearchParams, originalHandleSearch, isLoading]);

  // コンテキスト間の連携を行うloadMore関数
  const loadMore = useCallback(() => {
    console.log('Loading more items with filters:', filterOptions);
    console.log('Show selected only:', showSelectedOnly);
    originalLoadMore(filterOptions, showSelectedOnly);
  }, [originalLoadMore, filterOptions, showSelectedOnly]);

  // 検索時にURLを更新する修正版handleSearch関数
  const handleSearch = useCallback((e: React.FormEvent, newPage?: number, resetFunc?: () => void, clearFunc?: () => void, sortFunc?: () => void) => {
    e.preventDefault();
    
    // 新しいページが指定されていれば、ページネーションを更新
    if (newPage) {
      setSearchParams(prev => ({ ...prev, page: newPage }));
    }
    
    // 検索を実行
    originalHandleSearch(e, newPage, resetFunc, clearFunc, sortFunc);
    
    // 現在のURLのパスを取得
    const currentPath = location.pathname;
    const currentSearch = new URLSearchParams(location.search).get('keyword');
    
    // URLを検索クエリで更新（既に同じキーワードのURLにいる場合は更新しない）
    if (searchParams.keyword && (currentPath !== '/search' || currentSearch !== searchParams.keyword)) {
      navigate(`/search?keyword=${encodeURIComponent(searchParams.keyword)}`);
    }
  }, [originalHandleSearch, searchParams.keyword, navigate, setSearchParams, location]);

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

  // 検索ページまたは結果ページのコンポーネントを表示
  const renderContent = () => {
    if (location.pathname === '/search' || (results.length > 0 && currentSearchKeyword)) {
      return (
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
          hideSelectedItems={hideSelectedItems}
          setHideSelectedItems={setHideSelectedItems}
          toggleItemSelection={toggleItemSelection}
          clearSelectedItems={clearSelectedItems}
          handleRangeSelection={handleRangeSelection}
          toggleSelectAll={toggleSelectAll}
          statistics={statistics || defaultStats}
          selectedStatistics={selectedStatistics || defaultStats}
          hasFilters={hasFilters()}
        />
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={renderContent()} />
        <Route path="/search" element={renderContent()} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;