import { useState, useMemo } from 'react';
import { FilterOptions, AuctionItem, ProductTag } from '../types';
import { PRODUCT_TAGS } from '../constants/productTags';

/**
 * フィルタリング機能を提供するカスタムフック
 */
export const useFilterOptions = (results: AuctionItem[]) => {
  // フィルター状態
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedTags: [],
    excludeMultipleBids: false,
    excludeJunk: false,
    excludeKeywords: [],
    excludeSets: false,
    excludeNew: false,
    filterKeywords: [],
    excludeFreeShipping: false
  });
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [filterKeyword, setFilterKeyword] = useState('');
  const [newFilterKeyword, setNewFilterKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [showTags, setShowTags] = useState(false);

  /**
   * 商品名からタグを抽出する関数
   * @param title - 商品名
   * @returns 抽出されたタグの配列
   */
  const getProductTags = (title: string): ProductTag[] => {
    if (!title) return [];
    return PRODUCT_TAGS.filter(tag => title.includes(tag.keyword));
  };

  /**
   * タグフィルターの切り替え関数
   * @param keyword - タグのキーワード
   */
  const toggleTagFilter = (keyword: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  /**
   * 全てのフィルターをリセットする関数
   */
  const resetAllFilters = () => {
    setSelectedTags(new Set());
    setFilterKeyword('');
    setNewFilterKeyword('');
    setNewExcludeKeyword('');
    setFilterOptions({
      selectedTags: [],
      excludeMultipleBids: false,
      excludeJunk: false,
      excludeKeywords: [],
      excludeSets: false,
      excludeNew: false,
      filterKeywords: [],
      excludeFreeShipping: false
    });
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
    setFilterOptions(prev => ({
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
    setFilterOptions(prev => ({
      ...prev,
      excludeKeywords: [...prev.excludeKeywords, keyword.trim()]
    }));
    setNewExcludeKeyword('');
  };

  /**
   * 含むキーワードフィルターを削除
   */
  const removeFilterKeyword = (index: number) => {
    setFilterOptions(prev => ({
      ...prev,
      filterKeywords: prev.filterKeywords.filter((_, i) => i !== index)
    }));
  };

  /**
   * 除外キーワードフィルターを削除
   */
  const removeExcludeKeyword = (index: number) => {
    setFilterOptions(prev => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter((_, i) => i !== index)
    }));
  };

  return {
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
  };
}; 