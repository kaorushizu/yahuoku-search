import { useState, useMemo } from 'react';
import { FilterOptions, AuctionItem, ProductTag } from '../types';
import { PRODUCT_TAGS } from '../constants/productTags';
import { useFilterSystem } from './useFilterSystem';

/**
 * フィルタリング機能を提供するカスタムフック
 * useFilterSystem との互換性を保ちながら、従来のコードとの互換性も維持
 * 
 * @param results - フィルタリング対象の商品配列
 * @returns フィルター関連の状態と機能
 */
export const useFilterOptions = (results: AuctionItem[]) => {
  // 内部状態
  const [newFilterKeyword, setNewFilterKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [showTags, setShowTags] = useState(false);

  // useFilterSystemを活用
  const filterSystem = useFilterSystem(getProductTags);

  /**
   * 商品名からタグを抽出する関数
   * @param title - 商品名
   * @returns 抽出されたタグの配列
   */
  function getProductTags(title: string): ProductTag[] {
    if (!title) return [];
    return PRODUCT_TAGS.filter(tag => title.includes(tag.keyword));
  }

  /**
   * タグフィルターの切り替え関数
   * @param keyword - タグのキーワード
   */
  const toggleTagFilter = (keyword: string) => {
    filterSystem.toggleTagFilter(keyword);
  };

  /**
   * 全てのフィルターをリセットする関数
   */
  const resetAllFilters = () => {
    setFilterKeyword('');
    setNewFilterKeyword('');
    setNewExcludeKeyword('');
    filterSystem.clearAllFilters();
  };

  /**
   * 利用可能なタグとその使用回数を計算する
   */
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    results.forEach(item => {
      const itemTags = getProductTags(item.商品名);
      itemTags.forEach(tag => {
        tagCounts.set(tag.keyword, (tagCounts.get(tag.keyword) || 0) + 1);
      });
    });

    return PRODUCT_TAGS
      .map(tag => ({
        tag,
        count: tagCounts.get(tag.keyword) || 0
      }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  }, [results]);

  /**
   * キーワードを含むフィルターを追加する
   */
  const addFilterKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    filterSystem.setFilterOptions(prev => ({
      ...prev,
      filterKeywords: [...prev.filterKeywords, keyword.trim()]
    }));
    setNewFilterKeyword('');
  };

  /**
   * キーワードを除外フィルターに追加する
   */
  const addExcludeKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    filterSystem.setFilterOptions(prev => ({
      ...prev,
      excludeKeywords: [...prev.excludeKeywords, keyword.trim()]
    }));
    setNewExcludeKeyword('');
  };

  /**
   * 含むキーワードフィルターを削除
   */
  const removeFilterKeyword = (index: number) => {
    filterSystem.setFilterOptions(prev => ({
      ...prev,
      filterKeywords: prev.filterKeywords.filter((_, i) => i !== index)
    }));
  };

  /**
   * 除外キーワードフィルターを削除
   */
  const removeExcludeKeyword = (index: number) => {
    filterSystem.setFilterOptions(prev => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter((_, i) => i !== index)
    }));
  };

  return {
    // useFilterSystemからの状態と機能
    filterOptions: filterSystem.filterOptions,
    setFilterOptions: filterSystem.setFilterOptions,
    selectedTags: filterSystem.selectedTags,
    setSelectedTags: filterSystem.setSelectedTags,
    
    // この機能固有の状態
    filterKeyword,
    setFilterKeyword,
    newFilterKeyword,
    setNewFilterKeyword,
    newExcludeKeyword,
    setNewExcludeKeyword,
    showTags,
    setShowTags,
    
    // 機能
    getProductTags,
    toggleTagFilter,
    resetAllFilters,
    availableTags,
    addFilterKeyword,
    addExcludeKeyword,
    removeFilterKeyword,
    removeExcludeKeyword,
    
    // 追加でuseFilterSystemの機能を公開
    activeFilters: filterSystem.activeFilters,
    hasActiveFilters: filterSystem.hasActiveFilters,
    addFilter: filterSystem.addFilter,
    removeFilter: filterSystem.removeFilter,
    applyFilters: filterSystem.applyFilters,
    priceRanges: filterSystem.priceRanges,
    togglePriceRangeFilter: filterSystem.togglePriceRangeFilter
  };
}; 