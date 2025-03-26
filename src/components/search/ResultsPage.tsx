import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import ResultsContainer from './ResultsContainer';
import SelectedItemsPanel from '../statistics/SelectedItemsPanel';
import HelpPage from '../HelpPage';
import ScrollToTopButton from '../common/ScrollToTopButton';
import { AuctionItem, FilterOptions, SearchParams, Statistics } from '../../types';
import { ProductTag } from '../../types';
import { useSearch } from '../../contexts/SearchContext';
import { useFilter } from '../../contexts/FilterContext';
import { useSelection } from '../../contexts/SelectionContext';
import { useStatistics } from '../../hooks';

/**
 * 検索結果を表示するページコンポーネント
 * ヘッダー、検索結果一覧、選択アイテムパネルなどを含む
 */
const ResultsPage: React.FC = () => {
  // 各コンテキストからデータを取得
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
    loadMore: originalLoadMore
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
  
  // ナビゲーション関連
  const navigate = useNavigate();
  const location = useLocation();
  
  // URLからの検索が実行されたかを追跡するref
  const initialSearchExecutedRef = useRef(false);
  const mountedRef = useRef(false);

  // filteredResultsの統計情報を計算
  const statistics = useStatistics(filteredResults);
  
  // URLからクエリパラメータを取得して検索を実行する（初回マウント時のみ）
  useLayoutEffect(() => {
    if (mountedRef.current) {
      return; // 初回マウント後は実行しない
    }
    
    mountedRef.current = true;
    
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword');
    const minPrice = searchParams.get('min');
    const maxPrice = searchParams.get('max');
    const sellerId = searchParams.get('seller');
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const excludeParam = searchParams.get('exclude');
    
    // 検索パラメータの初期設定
    const updatedSearchParams: {[key: string]: any} = {};
    if (keyword && keyword.trim() !== '') updatedSearchParams.keyword = keyword;
    if (minPrice) updatedSearchParams.minPrice = minPrice;
    if (maxPrice) updatedSearchParams.maxPrice = maxPrice;
    if (sellerId) updatedSearchParams.sellerId = sellerId;
    if (status) updatedSearchParams.status = status;
    if (page && !isNaN(parseInt(page))) updatedSearchParams.page = parseInt(page);
    if (excludeParam) updatedSearchParams.excludeKeywords = excludeParam.split(',').map(k => k.trim()).filter(Boolean);
    
    // パラメータがある場合、検索を実行
    if (Object.keys(updatedSearchParams).length > 0 && !isLoading) {
      // 検索パラメータを設定
      setSearchParams(prev => ({ ...prev, ...updatedSearchParams }));
      
      // 検索実行条件：キーワードがある、またはセラーID/ステータス/価格範囲のいずれかが指定されている
      const shouldExecuteSearch = 
        (keyword && keyword.trim() !== '') || 
        sellerId || 
        status || 
        minPrice || 
        maxPrice;
      
      if (shouldExecuteSearch) {
        // マイクロタスクとして検索を実行（レンダリングサイクルを確実に分離）
        Promise.resolve().then(() => {
          // 検索済みフラグを立てる
          initialSearchExecutedRef.current = true;
          
          try {
            // 重要: setSearchParamsでの更新を待たずに、直接パラメータを渡す
            const updatedSearchParamsForSearch = {
              ...searchParams,
              keyword: keyword || '',
              minPrice: minPrice || '',
              maxPrice: maxPrice || '',
              sellerId: sellerId || '',
              status: status || '',
              page: page ? parseInt(page) : 1,
              excludeKeywords: excludeParam ? excludeParam.split(',').map(k => k.trim()).filter(Boolean) : []
            };
            
            // フォームイベントをシミュレート - 追加のパラメータも含める
            const mockFormEvent = {
              preventDefault: () => {},
              target: {
                elements: {
                  keyword: { value: keyword || '' }
                }
              },
              // 検索パラメータを追加
              searchParams: updatedSearchParamsForSearch
            } as unknown as React.FormEvent;
            
            // 標準の検索フローで実行
            handleSearchWithReset(mockFormEvent);
          } catch (error) {
            console.error('URLからの検索実行中にエラーが発生しました:', error);
          }
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 検索パラメーターが変わったらURLからの検索フラグをリセット
  useEffect(() => {
    if (!initialSearchExecutedRef.current) return;
    
    // フォームからの検索時にフラグをリセット
    initialSearchExecutedRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.keyword]);

  // コンテキスト間の連携を行うloadMore関数
  const loadMore = useCallback(() => {
    originalLoadMore(filterOptions, showSelectedOnly);
  }, [originalLoadMore, filterOptions, showSelectedOnly]);

  // 検索時にURLを更新する修正版handleSearch関数
  const handleSearch = useCallback((e: React.FormEvent, newPage?: number, resetFunc?: () => void, clearFunc?: () => void, sortFunc?: () => void) => {
    e.preventDefault();
    
    // 検索前にURLをすぐに更新することを禁止する（検索フラグを事前に設定）
    initialSearchExecutedRef.current = true;
    
    // 新しいページが指定されていれば、ページネーションを更新
    if (newPage) {
      setSearchParams(prev => ({ ...prev, page: newPage }));
    }
    
    // 検索を実行
    originalHandleSearch(e, newPage, resetFunc, clearFunc, sortFunc);
    
    // 検索パラメータの判定 - いずれかのパラメータが設定されている場合にURLを更新
    const hasSearchParams = 
      (searchParams.keyword && searchParams.keyword.trim() !== '') || 
      searchParams.minPrice || 
      searchParams.maxPrice || 
      searchParams.sellerId || 
      searchParams.status || 
      (searchParams.excludeKeywords && searchParams.excludeKeywords.length > 0);
    
    // いずれかの検索パラメータがある場合はURLを更新
    if (hasSearchParams) {
      // URLパラメータを構築
      const urlParams = new URLSearchParams();
      
      // 基本検索パラメータの追加
      if (searchParams.keyword && searchParams.keyword.trim() !== '') {
        urlParams.set('keyword', searchParams.keyword.trim());
      }
      
      // 詳細検索パラメータの追加
      if (searchParams.minPrice) urlParams.set('min', searchParams.minPrice);
      if (searchParams.maxPrice) urlParams.set('max', searchParams.maxPrice);
      if (searchParams.sellerId) urlParams.set('seller', searchParams.sellerId);
      if (searchParams.status) urlParams.set('status', searchParams.status);
      if (searchParams.page > 1) urlParams.set('page', searchParams.page.toString());
      if (searchParams.excludeKeywords && searchParams.excludeKeywords.length > 0) {
        urlParams.set('exclude', searchParams.excludeKeywords.join(','));
      }
      
      // ナビゲート（Replace: trueで履歴に残さない）
      requestAnimationFrame(() => {
        navigate(`/search?${urlParams.toString()}`, { replace: true });
      });
    }
  }, [originalHandleSearch, searchParams, navigate, setSearchParams, initialSearchExecutedRef]);

  // フィルター追加ヘルパー関数
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

  // 無限スクロール用のRef
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // ソートリセット関数
  const [resetSortOrder, setResetSortOrder] = useState<(() => void) | null>(null);
  
  // ResultsContainerからソートリセット関数を受け取るハンドラ
  const handleResetSortOrderChange = useCallback((resetFunc: () => void) => {
    setResetSortOrder(() => resetFunc);
  }, []);

  // ItemRangeSelection wrapper function
  const handleItemRangeSelection = (id: string) => {
    handleRangeSelection(id, results, false);
  };

  // ToggleSelectAll wrapper
  const handleToggleSelectAll = () => {
    toggleSelectAll(filteredResults);
  };
  
  // 検索ハンドラー - ソートリセット関数を追加
  const handleSearchWithReset = (e: React.FormEvent, newPage?: number) => {
    handleSearch(e, newPage, resetAllFilters, clearSelectedItems, resetSortOrder || undefined);
  };

  // デフォルトの統計情報
  const defaultStats = {
    median: 0,
    average: 0,
    min: 0,
    max: 0,
    priceRanges: []
  };

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
        handleSearch={handleSearchWithReset}
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
              statistics={statistics || defaultStats}
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
              hideSelectedItems={hideSelectedItems}
              hasPriceRangeFilter={hasPriceRangeFilter}
              currentPage={searchParams.page}
              totalPages={totalPages}
              observerTarget={observerTarget}
              onResetSortOrderChange={handleResetSortOrderChange}
            />
          </div>
        </div>
      </main>

      {/* ページトップへ戻るボタン */}
      <ScrollToTopButton />

      {/* 選択アイテムパネル */}
      {selectedItems.size > 0 && (
        <SelectedItemsPanel
          selectedItems={selectedItems}
          showSelectedOnly={showSelectedOnly}
          setShowSelectedOnly={setShowSelectedOnly}
          hideSelectedItems={hideSelectedItems}
          setHideSelectedItems={setHideSelectedItems}
          toggleItemSelection={toggleItemSelection}
          clearSelectedItems={clearSelectedItems}
          selectedStatistics={selectedStatistics || defaultStats}
          filteredResults={filteredResults}
          getAuctionUrl={getAuctionUrl}
        />
      )}

      {/* ヘルプページ */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[85vh] overflow-y-auto">
            <HelpPage onClose={() => setShowHelp(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPage; 