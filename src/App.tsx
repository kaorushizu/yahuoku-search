import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SlidersHorizontal, HelpCircle, LayoutGrid, Table } from 'lucide-react';
import HelpPage from './components/HelpPage';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import SearchForm from './components/search/SearchForm';
import AdvancedSearchPanel from './components/search/AdvancedSearchPanel';
import ResultsContainer from './components/search/ResultsContainer';
import SelectedItemsPanel from './components/statistics/SelectedItemsPanel';
import { useAuctionSearch, useFilterOptions, useItemSelection, useStatistics, useResultsFilter } from './hooks';

function App() {
  // カスタムフックの使用
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
    getAuctionUrl,
    handleSearch: originalHandleSearch,
    loadMore: originalLoadMore,
    resetSearch
  } = useAuctionSearch();
  
  // フィルタリング機能を提供するフックを使用
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
    getProductTags,
    toggleTagFilter,
    resetAllFilters,
    availableTags,
    addFilterKeyword,
    addExcludeKeyword,
    removeFilterKeyword,
    removeExcludeKeyword
  } = useFilterOptions(results);
  
  // アイテム選択機能を提供するフックを使用
  const {
    selectedItems,
    setSelectedItems,
    showSelectedOnly,
    setShowSelectedOnly,
    toggleItemSelection,
    clearSelectedItems,
    handleRangeSelection,
    toggleSelectAll
  } = useItemSelection();
  
  // UI関連の状態
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');
  
  // 価格範囲フィルターをリセットする関数（ResultsContainerで定義される）
  const [clearPriceRangeFilters, setClearPriceRangeFilters] = useState<() => void>(() => () => {});
  
  // 価格範囲フィルターが有効かどうかのフラグ
  const [hasPriceRangeFilter, setHasPriceRangeFilter] = useState(false);
  
  // レガシーコードとの互換性を保つためのラッパー関数
  const handleSearch = (e: React.FormEvent, newPage?: number) => {
    // 新しい検索の場合（ページネーションでない場合）は価格フィルターもリセット
    if (!newPage) {
      clearPriceRangeFilters();
    }
    originalHandleSearch(e, filterOptions, newPage, resetAllFilters, clearSelectedItems);
  };
  
  const loadMore = useCallback(() => {
    originalLoadMore(filterOptions, showSelectedOnly);
  }, [originalLoadMore, filterOptions, showSelectedOnly]);

  // ResultsContainerとの互換性のためのラッパー関数
  const handleItemRangeSelection = useCallback((id: string) => {
    handleRangeSelection(id, results, false);
  }, [handleRangeSelection, results]);

  const handleAddFilterKeyword = useCallback(() => {
    if (newFilterKeyword.trim()) {
      addFilterKeyword(newFilterKeyword.trim());
    }
  }, [addFilterKeyword, newFilterKeyword]);

  const handleAddExcludeKeyword = useCallback(() => {
    if (newExcludeKeyword.trim()) {
      addExcludeKeyword(newExcludeKeyword.trim());
    }
  }, [addExcludeKeyword, newExcludeKeyword]);
  
  // フィルタリング結果をカスタムフックから取得
  const filteredResults = useResultsFilter(
    results,
    filterOptions,
    'none', // ソートオーダーはResultsContainerに移動
    selectedItems,
    showSelectedOnly,
    selectedTags,
    getProductTags
  );
  
  const handleToggleSelectAll = useCallback(() => {
    toggleSelectAll(filteredResults);
  }, [toggleSelectAll, filteredResults]);

  // 統計情報を計算するカスタムフックを使用
  const statistics = useStatistics(filteredResults);
  const selectedStatistics = useStatistics(
    results.filter(item => selectedItems.has(item.オークションID))
  );
  
  // Refs
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 無限スクロール用のIntersectionObserver
  useEffect(() => {
    if (!observerTarget.current) return;

    // フィルターが適用されているかチェック
    const hasFilters = showSelectedOnly || 
      selectedTags.size > 0 || 
      filterOptions.filterKeywords.length > 0 || 
      filterOptions.excludeKeywords.length > 0 || 
      filterOptions.excludeJunk || 
      filterOptions.excludeMultipleBids || 
      filterOptions.excludeNew || 
      filterOptions.excludeSets || 
      filterOptions.excludeFreeShipping;
    
    // フィルターが適用されている場合は無限スクロールを実行しない
    if (hasFilters) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore, showSelectedOnly, selectedTags, filterOptions]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 初期画面：検索フォーム */}
      {results.length === 0 && !currentSearchKeyword ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ヤフオク相場検索</h1>
          <p className="text-gray-600 text-lg mb-8">過去の落札商品から価格相場をリサーチ</p>
          <div className="w-full max-w-2xl px-4">
            <SearchForm 
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              searchHistory={searchHistory}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            {/* 詳細検索ボタン */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm ${
                  isAdvancedSearch || Object.values(searchParams).some(value => value && typeof value === 'string' && value.length > 0 && value !== searchParams.keyword)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal size={16} />
                詳細検索
              </button>
            </div>
            {/* 詳細検索パネル */}
            {isAdvancedSearch && (
              <AdvancedSearchPanel
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                isCompanyOnly={isCompanyOnly}
                setIsCompanyOnly={setIsCompanyOnly}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* ヘッダー部分 */}
          <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-8xl mx-auto px-4">
              <div className="flex items-center h-14">
                <h1 className="hidden md:block text-lg font-bold text-white mr-8 whitespace-nowrap">ヤフオク相場検索</h1>
                {/* 検索バー */}
                <div className="flex items-center flex-1 max-w-3xl gap-2">
                  <SearchForm 
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    searchHistory={searchHistory}
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    isHeader={true}
                  />
                  {/* 詳細検索ボタン */}
                  <div className="hidden md:flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs relative ${
                        isAdvancedSearch || Object.values(searchParams).some(value => value && typeof value === 'string' && value.length > 0 && value !== searchParams.keyword)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <SlidersHorizontal size={14} />
                      <span>詳細検索</span>
                      {/* アクティブな検索条件の表示 */}
                      {!isAdvancedSearch && Object.entries(searchParams).some(([key, value]) => {
                        if (key === 'keyword' || key === 'page') return false;
                        return value && value.length > 0;
                      }) && (
                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-current border-opacity-20">
                          {searchParams.excludeKeywords.length > 0 && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">除外</span>
                          )}
                          {searchParams.status && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">
                              {searchParams.status === 'new' ? '新品' : '中古'}
                            </span>
                          )}
                          {searchParams.sellerId && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">出品者</span>
                          )}
                          {(searchParams.minPrice || searchParams.maxPrice) && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">価格</span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* 右側の要素をまとめて右寄せ */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* 検索結果件数表示 */}
                  <div className="hidden md:block">
                    <div className="text-sm text-gray-300">
                      <span className="font-bold text-lg text-white">{totalCount.toLocaleString()}</span>
                      <span className="mx-1">件中</span>
                      <span className="font-bold text-lg text-white">{filteredResults.length.toLocaleString()}</span>
                      <span className="mx-1">件表示</span>
                    </div>
                  </div>
                
                  {/* レイアウト切り替えボタン */}
                  {results.length > 0 && (
                    <div className="hidden md:flex items-center border border-gray-600 rounded-md overflow-hidden">
                      <button
                        onClick={() => setLayout('grid')}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                          layout === 'grid'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        title="グリッド表示"
                      >
                        <LayoutGrid size={14} />
                        <span>グリッド</span>
                      </button>
                      <button
                        onClick={() => setLayout('table')}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                          layout === 'table'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        title="テーブル表示"
                      >
                        <Table size={14} />
                        <span>テーブル</span>
                      </button>
                    </div>
                  )}
                
                  {/* モバイル用詳細検索ボタンとヘルプボタン */}
                  <div className="flex items-center">
                    <button
                      onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                      className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors duration-200"
                      title="詳細検索"
                    >
                      <SlidersHorizontal size={20} className="text-gray-400 hover:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setShowHelp(true)}
                      className="hidden md:block p-2 rounded hover:bg-gray-800 transition-colors duration-200"
                      title="ヘルプを表示"
                    >
                      <HelpCircle size={20} className="text-gray-400 hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 詳細検索パネル */}
              {isAdvancedSearch && (
                <AdvancedSearchPanel
                  searchParams={searchParams}
                  setSearchParams={setSearchParams}
                  isCompanyOnly={isCompanyOnly}
                  setIsCompanyOnly={setIsCompanyOnly}
                  isDarkMode={true}
                />
              )}
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="flex-1">
            <div className="max-w-8xl mx-auto px-4 py-6">
              {/* ResultsContainerが内部でグリッドレイアウトを持っているので、
                  ここでは単純にResultsContainerとページネーション部分を縦に並べるだけ */}
              <div>
                {/* 商品一覧（ResultsContainer） */}
                <ResultsContainer
                  results={results}
                  filteredResults={filteredResults}
                  isLoading={isLoading}
                  error={error}
                  currentSearchKeyword={searchParams.keyword}
                  statistics={statistics || { median: 0, average: 0, min: 0, max: 0, priceRanges: [] }}
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
                  addFilterKeyword={handleAddFilterKeyword}
                  addExcludeKeyword={handleAddExcludeKeyword}
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

                {/* ページネーション部分（削除） */}
                {/* ページネーションはResultsContainerに移動しました */}
              </div>
            </div>
          </main>
        </div>
      )}

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
}

export default App;