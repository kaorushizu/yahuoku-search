import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useFilterOptions, useResultsFilter } from '../hooks';
import { FilterType, PriceRange, useFilterSystem } from '../hooks/useFilterSystem';
import { AuctionItem, FilterOptions, ProductTag } from '../types';
import { useSearch } from './SearchContext';

// コンテキストの型定義
interface FilterContextType {
  // 基本フィルター状態
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  
  // タグフィルター状態
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  
  // キーワードフィルター関連
  filterKeyword: string;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newFilterKeyword: string;
  setNewFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newExcludeKeyword: string;
  setNewExcludeKeyword: React.Dispatch<React.SetStateAction<string>>;
  
  // タグ表示/非表示
  showTags: boolean;
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>;
  
  // 追加プロパティ
  availableTags: { tag: ProductTag; count: number }[];
  
  // 価格範囲フィルター
  priceRanges: PriceRange[];
  setPriceRanges: React.Dispatch<React.SetStateAction<PriceRange[]>>;
  hasPriceRangeFilter: boolean;
  setHasPriceRangeFilter: React.Dispatch<React.SetStateAction<boolean>>;
  
  // クリア関数
  clearPriceRangeFilters: () => void;
  setClearPriceRangeFilters: React.Dispatch<React.SetStateAction<() => void>>;
  
  // 機能
  getProductTags: (title: string) => ProductTag[];
  toggleTagFilter: (keyword: string) => void;
  resetAllFilters: () => void;
  addFilterKeyword: (keyword: string) => void;
  addExcludeKeyword: (keyword: string) => void;
  removeFilterKeyword: (index: number) => void;
  removeExcludeKeyword: (index: number) => void;
  
  // フィルターシステム機能
  addFilter: (type: FilterType, value: any) => void;
  removeFilter: (type: FilterType, id: string) => void;
  togglePriceRangeFilter: (rangeStart: number, rangeEnd: number, rangeText: string) => void;
  
  // アクティブフィルター情報
  activeFilters: any[];
  hasActiveFilters: boolean;
  
  // フィルタリング結果
  filteredResults: AuctionItem[];
}

// コンテキストの作成
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  // SearchContextからresultsを取得
  const { results } = useSearch();
  
  // useFilterOptionsフックを使用
  const filterOptionsHook = useFilterOptions(results);
  
  // useFilterSystemフックを使用
  const filterSystem = useFilterSystem(filterOptionsHook.getProductTags);
  
  // 価格範囲フィルター状態
  const [hasPriceRangeFilter, setHasPriceRangeFilter] = React.useState(false);
  const [clearPriceRangeFilters, setClearPriceRangeFilters] = React.useState<() => void>(() => () => {});
  
  // 選択状態は別コンテキストに移動予定なので、ここでは空のセットを使用
  const emptySelectedItems = new Set<string>();
  const showSelectedOnly = false;

  // フィルタリング結果を計算
  const filteredResults = useResultsFilter(
    results,
    filterSystem.filterOptions,
    'none', // ソート順は後からResultsListで設定
    emptySelectedItems,
    showSelectedOnly,
    filterSystem.selectedTags,
    filterOptionsHook.getProductTags
  );

  // すべてのフィルターをリセット
  const resetAllFilters = useCallback(() => {
    filterSystem.clearAllFilters();
    filterOptionsHook.resetAllFilters();
  }, [filterSystem, filterOptionsHook]);

  // toggleTagFilter関数をオーバーライド
  const toggleTagFilter = useCallback((keyword: string) => {
    console.log('FilterContext: タグフィルター切り替え', keyword);
    // filterSystemのtoggleTagFilterを直接使用
    filterSystem.toggleTagFilter(keyword);
  }, [filterSystem]);

  // フィルターシステムの状態をfilterOptionsHookと同期
  useEffect(() => {
    filterSystem.setFilterOptions(filterOptionsHook.filterOptions);
  }, [filterOptionsHook.filterOptions]);

  useEffect(() => {
    filterOptionsHook.setSelectedTags(filterSystem.selectedTags);
  }, [filterSystem.selectedTags]);

  // コンテキスト値の作成
  const contextValue: FilterContextType = {
    // filterOptionsHookから
    filterOptions: filterOptionsHook.filterOptions,
    setFilterOptions: filterOptionsHook.setFilterOptions,
    selectedTags: filterOptionsHook.selectedTags,
    setSelectedTags: filterOptionsHook.setSelectedTags,
    filterKeyword: filterOptionsHook.filterKeyword,
    setFilterKeyword: filterOptionsHook.setFilterKeyword,
    newFilterKeyword: filterOptionsHook.newFilterKeyword,
    setNewFilterKeyword: filterOptionsHook.setNewFilterKeyword,
    newExcludeKeyword: filterOptionsHook.newExcludeKeyword,
    setNewExcludeKeyword: filterOptionsHook.setNewExcludeKeyword,
    showTags: filterOptionsHook.showTags,
    setShowTags: filterOptionsHook.setShowTags,
    availableTags: filterOptionsHook.availableTags,
    getProductTags: filterOptionsHook.getProductTags,
    toggleTagFilter,
    resetAllFilters,
    addFilterKeyword: filterOptionsHook.addFilterKeyword,
    addExcludeKeyword: filterOptionsHook.addExcludeKeyword,
    removeFilterKeyword: filterOptionsHook.removeFilterKeyword,
    removeExcludeKeyword: filterOptionsHook.removeExcludeKeyword,
    
    // filterSystemから
    priceRanges: filterSystem.priceRanges,
    setPriceRanges: filterSystem.setPriceRanges,
    addFilter: filterSystem.addFilter,
    removeFilter: filterSystem.removeFilter,
    togglePriceRangeFilter: filterSystem.togglePriceRangeFilter,
    activeFilters: filterSystem.activeFilters,
    hasActiveFilters: filterSystem.hasActiveFilters,
    
    // 価格範囲フィルター関連
    hasPriceRangeFilter,
    setHasPriceRangeFilter,
    clearPriceRangeFilters,
    setClearPriceRangeFilters,
    
    // フィルタリング結果
    filteredResults
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

// カスタムフック
export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext; 