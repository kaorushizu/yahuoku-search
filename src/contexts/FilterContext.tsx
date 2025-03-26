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
  
  // クリア関数
  clearPriceRangeFilters: () => void;
  setClearPriceRangeFilters: React.Dispatch<React.SetStateAction<() => void>>;
  
  // フィルター状態
  hasPriceRangeFilter: boolean;
  setHasPriceRangeFilter: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveFilters: boolean;
  
  // アクションメソッド
  getProductTags: (title: string) => ProductTag[];
  toggleTagFilter: (tagKeyword: string) => void;
  resetAllFilters: () => void;
  addFilterKeyword: (keyword: string) => void;
  addExcludeKeyword: (keyword: string) => void;
  removeFilterKeyword: (index: number) => void;
  removeExcludeKeyword: (index: number) => void;
  addFilter: (type: FilterType, value: any) => void;
  removeFilter: (type: FilterType, id: string) => void;
  togglePriceRangeFilter: (rangeStart: number, rangeEnd: number, rangeText: string) => void;
  
  // フィルタリング結果
  filteredResults: AuctionItem[];
  
  // アクティブなフィルター情報
  activeFilters: {
    type: FilterType;
    id: string;
    label: string;
  }[];
}

// デフォルト値を作成
const defaultFilterContext: FilterContextType = {
  filterOptions: {
    filterKeywords: [],
    excludeKeywords: [],
    excludeJunk: false,
    excludeMultipleBids: false,
    excludeNew: false,
    excludeSets: false,
    excludeFreeShipping: false,
    selectedTags: []
  },
  setFilterOptions: () => {},
  selectedTags: new Set(),
  setSelectedTags: () => {},
  filterKeyword: '',
  setFilterKeyword: () => {},
  newFilterKeyword: '',
  setNewFilterKeyword: () => {},
  newExcludeKeyword: '',
  setNewExcludeKeyword: () => {},
  showTags: true,
  setShowTags: () => {},
  availableTags: [],
  getProductTags: () => { return []; },
  toggleTagFilter: () => {},
  resetAllFilters: () => {},
  addFilterKeyword: () => {},
  addExcludeKeyword: () => {},
  removeFilterKeyword: () => {},
  removeExcludeKeyword: () => {},
  addFilter: () => {},
  removeFilter: () => {},
  togglePriceRangeFilter: () => {},
  priceRanges: [],
  setPriceRanges: () => {},
  clearPriceRangeFilters: () => {},
  setClearPriceRangeFilters: () => {},
  hasPriceRangeFilter: false,
  setHasPriceRangeFilter: () => {},
  hasActiveFilters: false,
  filteredResults: [],
  activeFilters: []
};

// コンテキストの作成
const FilterContext = createContext<FilterContextType>(defaultFilterContext);

/**
 * FilterProvider - フィルター機能を提供するコンテキストプロバイダー
 */
export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // SearchContextから結果を取得
  const { results = [] } = useSearch();
  
  // フィルター関連の状態管理フック - 引数にresultsを渡す
  const filterOptionsHook = useFilterOptions(results);
  
  // フィルターシステムフック
  const filterSystem = useFilterSystem(filterOptionsHook.getProductTags);
  
  // 価格範囲フィルター状態
  const [hasPriceRangeFilter, setHasPriceRangeFilter] = React.useState(false);
  
  // clearPriceRangeFiltersの初期化 - useEffectで後から設定する
  const [clearPriceRangeFilters, setClearPriceRangeFilters] = React.useState<() => void>(() => {
    return () => {
      if (filterSystem && filterSystem.priceRanges) {
        // 元々の処理を実行
        filterSystem.priceRanges.forEach(range => {
          if (filterSystem.togglePriceRangeFilter) {
            filterSystem.togglePriceRangeFilter(range.min, range.max, range.label);
          }
        });
      }
    };
  });
  
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
    filterOptionsHook.getProductTags,
    filterSystem.priceRanges // 価格範囲フィルターを追加
  );

  // すべてのフィルターをリセット
  const resetAllFilters = useCallback(() => {
    filterSystem.clearAllFilters();
    filterOptionsHook.resetAllFilters();
    setHasPriceRangeFilter(false);
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
  }, [filterOptionsHook.filterOptions, filterSystem]);

  useEffect(() => {
    filterOptionsHook.setSelectedTags(filterSystem.selectedTags);
  }, [filterSystem.selectedTags, filterOptionsHook]);

  // priceRangesが変更されたときにフラグを更新
  useEffect(() => {
    if (filterSystem.priceRanges.length > 0 && !hasPriceRangeFilter) {
      setHasPriceRangeFilter(true);
    } else if (filterSystem.priceRanges.length === 0 && hasPriceRangeFilter) {
      setHasPriceRangeFilter(false);
    }
  }, [filterSystem.priceRanges, hasPriceRangeFilter]);

  // 価格範囲フィルターをクリアする関数
  const clearAllPriceRangeFilters = useCallback(() => {
    if (filterSystem && filterSystem.priceRanges) {
      // 全ての価格範囲フィルターを削除
      const rangesCopy = [...filterSystem.priceRanges];
      rangesCopy.forEach(range => {
        if (filterSystem.togglePriceRangeFilter) {
          filterSystem.togglePriceRangeFilter(range.min, range.max, range.label);
        }
      });
    }
  }, [filterSystem]);

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
    clearPriceRangeFilters: clearAllPriceRangeFilters,
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