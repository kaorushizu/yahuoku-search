import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { AuctionItem, SearchParams, Statistics } from '../types';
import { useAuctionSearch } from '../hooks';
import { FilterOptions } from '../types/search';

// コンテキストの型定義
interface SearchContextType {
  // 状態
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  currentSearchKeyword: string;
  searchHistory: string[];
  results: AuctionItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  totalPages: number;
  totalCount: number;
  error: string | null;
  isCompanyOnly: boolean;
  setIsCompanyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  
  // 機能
  handleSearch: (e: React.FormEvent, newPage?: number, resetFunc?: () => void, clearSelectedFunc?: () => void) => void;
  loadMore: (filterOptions: FilterOptions, showSelectedOnly: boolean) => void;
  resetSearch: () => void;
  getAuctionUrl: (id: string, endDate: string) => string;
}

// コンテキストの初期値を定義
const defaultSearchContext: SearchContextType = {
  searchParams: { keyword: '', page: 1, excludeKeywords: [], status: '', sellerId: '', minPrice: '', maxPrice: '' },
  setSearchParams: () => {},
  currentSearchKeyword: '',
  searchHistory: [],
  results: [],
  isLoading: false,
  isLoadingMore: false,
  totalPages: 0,
  totalCount: 0,
  error: null,
  isCompanyOnly: false,
  setIsCompanyOnly: () => {},
  
  handleSearch: () => {},
  loadMore: () => {},
  resetSearch: () => {},
  getAuctionUrl: () => '',
};

// コンテキストの作成
const SearchContext = createContext<SearchContextType>(defaultSearchContext);

// プロバイダーコンポーネント
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  // 価格範囲フィルターをリセットする関数
  const [clearPriceRangeFilters, setClearPriceRangeFilters] = useState<() => void>(() => () => {});

  // useAuctionSearchフックを使用して検索機能を取得
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

  // 検索ハンドラをラップ
  const handleSearch = useCallback(
    (e: React.FormEvent, newPage?: number, resetFilterFunc?: () => void, clearSelectedFunc?: () => void) => {
      // 新しい検索の場合（ページネーションでない場合）は価格フィルターもリセット
      if (!newPage) {
        clearPriceRangeFilters();
      }
      
      // フィルタリングオプションは後からFilterContextから取得するため、ここでは空のオブジェクトを渡す
      const emptyFilterOptions: FilterOptions = {
        filterKeywords: [],
        excludeKeywords: [],
        excludeJunk: false,
        excludeMultipleBids: false,
        excludeNew: false,
        excludeSets: false,
        excludeFreeShipping: false,
        selectedTags: []
      };
      
      originalHandleSearch(e, emptyFilterOptions, newPage, resetFilterFunc, clearSelectedFunc);
    },
    [originalHandleSearch, clearPriceRangeFilters]
  );

  // loadMoreをラップして、フィルター状態と選択状態を考慮
  const loadMore = useCallback((filterOptions: FilterOptions, showSelectedOnly: boolean) => {
    originalLoadMore(filterOptions, showSelectedOnly);
  }, [originalLoadMore]);

  // コンテキスト値の作成
  const contextValue: SearchContextType = {
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
    loadMore,
    resetSearch,
    getAuctionUrl
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// カスタムフック
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext; 