import { useState, useCallback, useMemo } from 'react';
import { AuctionItem, FilterOptions } from '../types';

// すべてのフィルタータイプを定義
export type FilterType = 
  | 'price'      // 価格範囲
  | 'keyword'    // キーワード
  | 'exclude'    // 除外キーワード
  | 'tag'        // タグ
  | 'condition'  // 状態（新品/中古）
  | 'shipping'   // 送料
  | 'selection'; // 選択された商品

// 価格範囲フィルターの型
export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

// フィルター情報の型
export interface FilterInfo {
  type: FilterType;
  label: string;
  value: any;
  id: string;
}

// フィルター状態管理
export const useFilterSystem = (getProductTags: (title: string) => Array<{keyword: string, count: number}>) => {
  // 基本フィルター
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    filterKeywords: [],
    excludeKeywords: [],
    excludeJunk: false,
    excludeMultipleBids: false,
    excludeNew: false,
    excludeSets: false,
    excludeFreeShipping: false,
  });

  // 価格範囲フィルター
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  
  // タグフィルター
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  // 選択商品フィルター
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // アクティブフィルター情報を取得
  const activeFilters = useMemo(() => {
    const filters: FilterInfo[] = [];
    
    // 価格範囲フィルター
    priceRanges.forEach((range, index) => {
      filters.push({
        type: 'price',
        label: range.max === Number.MAX_SAFE_INTEGER 
          ? `¥${range.min.toLocaleString()}以上` 
          : `¥${range.min.toLocaleString()}～¥${range.max.toLocaleString()}`,
        value: range,
        id: `price-${index}`
      });
    });
    
    // キーワードフィルター
    filterOptions.filterKeywords.forEach((keyword, index) => {
      filters.push({
        type: 'keyword',
        label: keyword,
        value: keyword,
        id: `keyword-${index}`
      });
    });
    
    // 除外キーワード
    filterOptions.excludeKeywords.forEach((keyword, index) => {
      filters.push({
        type: 'exclude',
        label: `除外: ${keyword}`,
        value: keyword,
        id: `exclude-${index}`
      });
    });
    
    // タグフィルター
    [...selectedTags].forEach((tag, index) => {
      filters.push({
        type: 'tag',
        label: tag,
        value: tag,
        id: `tag-${index}`
      });
    });
    
    // その他のフィルター
    if (filterOptions.excludeJunk) {
      filters.push({type: 'condition', label: 'ジャンク品を除外', value: true, id: 'excludeJunk'});
    }
    if (filterOptions.excludeNew) {
      filters.push({type: 'condition', label: '新品を除外', value: true, id: 'excludeNew'});
    }
    if (filterOptions.excludeMultipleBids) {
      filters.push({type: 'condition', label: '入札多数を除外', value: true, id: 'excludeMultipleBids'});
    }
    if (filterOptions.excludeSets) {
      filters.push({type: 'condition', label: 'セット品を除外', value: true, id: 'excludeSets'});
    }
    if (filterOptions.excludeFreeShipping) {
      filters.push({type: 'shipping', label: '送料無料を除外', value: true, id: 'excludeFreeShipping'});
    }
    
    // 選択商品フィルター
    if (showSelectedOnly) {
      filters.push({type: 'selection', label: '選択した商品のみ', value: true, id: 'showSelectedOnly'});
    }
    
    return filters;
  }, [
    filterOptions,
    priceRanges,
    selectedTags,
    showSelectedOnly
  ]);

  // フィルターの追加
  const addFilter = useCallback((type: FilterType, value: any) => {
    switch (type) {
      case 'price':
        setPriceRanges(prev => [...prev, value]);
        break;
      case 'keyword':
        setFilterOptions(prev => ({
          ...prev,
          filterKeywords: [...prev.filterKeywords, value]
        }));
        break;
      case 'exclude':
        setFilterOptions(prev => ({
          ...prev,
          excludeKeywords: [...prev.excludeKeywords, value]
        }));
        break;
      case 'tag':
        setSelectedTags(prev => new Set([...prev, value]));
        break;
      case 'condition':
      case 'shipping':
        setFilterOptions(prev => ({
          ...prev,
          ...value
        }));
        break;
      case 'selection':
        setShowSelectedOnly(value);
        break;
    }
  }, []);

  // フィルターの削除
  const removeFilter = useCallback((type: FilterType, id: string) => {
    switch (type) {
      case 'price':
        const [, indexStr] = id.split('-');
        const index = parseInt(indexStr, 10);
        setPriceRanges(prev => prev.filter((_, i) => i !== index));
        break;
      case 'keyword':
        const [, keywordIndexStr] = id.split('-');
        const keywordIndex = parseInt(keywordIndexStr, 10);
        setFilterOptions(prev => ({
          ...prev,
          filterKeywords: prev.filterKeywords.filter((_, i) => i !== keywordIndex)
        }));
        break;
      case 'exclude':
        const [, excludeIndexStr] = id.split('-');
        const excludeIndex = parseInt(excludeIndexStr, 10);
        setFilterOptions(prev => ({
          ...prev,
          excludeKeywords: prev.excludeKeywords.filter((_, i) => i !== excludeIndex)
        }));
        break;
      case 'tag':
        const [, tagIndexStr] = id.split('-');
        const tagIndex = parseInt(tagIndexStr, 10);
        const tagArray = [...selectedTags];
        if (tagIndex >= 0 && tagIndex < tagArray.length) {
          const newTags = new Set(selectedTags);
          newTags.delete(tagArray[tagIndex]);
          setSelectedTags(newTags);
        }
        break;
      case 'condition':
      case 'shipping':
        // Boolean値のフィルター（checkboxなど）は直接反転
        setFilterOptions(prev => ({
          ...prev,
          [id]: false
        }));
        break;
      case 'selection':
        setShowSelectedOnly(false);
        break;
    }
  }, [selectedTags]);

  // すべてのフィルターをクリア
  const clearAllFilters = useCallback(() => {
    setFilterOptions({
      filterKeywords: [],
      excludeKeywords: [],
      excludeJunk: false,
      excludeMultipleBids: false,
      excludeNew: false,
      excludeSets: false,
      excludeFreeShipping: false,
    });
    setPriceRanges([]);
    setSelectedTags(new Set());
    setShowSelectedOnly(false);
  }, []);

  // 価格範囲フィルター
  const togglePriceRangeFilter = useCallback((rangeStart: number, rangeEnd: number, rangeText: string) => {
    // 同じ範囲がすでに選択されているか確認
    const isAlreadySelected = priceRanges.some(
      range => range.min === rangeStart && range.max === rangeEnd
    );

    if (isAlreadySelected) {
      // 同じ範囲をクリックした場合はその範囲のみを削除
      setPriceRanges(prev => 
        prev.filter(range => !(range.min === rangeStart && range.max === rangeEnd))
      );
    } else {
      // 新しい価格範囲を追加
      const newRange: PriceRange = {
        min: rangeStart,
        max: rangeEnd,
        label: rangeText
      };
      setPriceRanges(prev => [...prev, newRange]);
    }
  }, [priceRanges]);

  // フィルター適用（すべてのフィルター処理を統合）
  const applyFilters = useCallback((itemsToFilter: AuctionItem[]) => {
    let filteredItems = [...itemsToFilter];
    
    // 価格範囲フィルター
    if (priceRanges.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const price = item.落札金額;
        return priceRanges.some(range => {
          return price >= range.min && 
                (range.max === Number.MAX_SAFE_INTEGER ? true : price < range.max);
        });
      });
    }
    
    // キーワードフィルター
    if (filterOptions.filterKeywords.length > 0) {
      const keywords = filterOptions.filterKeywords.map(kw => kw.toLowerCase());
      filteredItems = filteredItems.filter(item => {
        const title = item.商品名.toLowerCase();
        return keywords.some(keyword => title.includes(keyword));
      });
    }
    
    // 除外キーワード
    if (filterOptions.excludeKeywords.length > 0) {
      const excludeKeywords = filterOptions.excludeKeywords.map(kw => kw.toLowerCase());
      filteredItems = filteredItems.filter(item => {
        const title = item.商品名.toLowerCase();
        return !excludeKeywords.some(keyword => title.includes(keyword));
      });
    }
    
    // タグフィルター
    if (selectedTags.size > 0) {
      filteredItems = filteredItems.filter(item => {
        const itemTags = getProductTags(item.商品名);
        return itemTags.some(tag => selectedTags.has(tag.keyword));
      });
    }
    
    // 選択商品フィルター
    if (showSelectedOnly) {
      filteredItems = filteredItems.filter(item => selectedItems.has(item.オークションID));
    }
    
    // その他のフィルター（ジャンク品、新品、入札多数など）
    if (filterOptions.excludeJunk) {
      filteredItems = filteredItems.filter(item => !item.商品名.toLowerCase().includes('ジャンク'));
    }
    
    if (filterOptions.excludeNew) {
      filteredItems = filteredItems.filter(item => item.状態 !== '新品');
    }
    
    if (filterOptions.excludeMultipleBids) {
      filteredItems = filteredItems.filter(item => item.入札件数 <= 1);
    }
    
    if (filterOptions.excludeSets) {
      filteredItems = filteredItems.filter(item => !item.商品名.toLowerCase().includes('セット'));
    }
    
    if (filterOptions.excludeFreeShipping) {
      filteredItems = filteredItems.filter(item => item.送料負担 !== '落札者');
    }
    
    return filteredItems;
  }, [
    filterOptions,
    priceRanges,
    selectedTags,
    selectedItems,
    showSelectedOnly,
    getProductTags
  ]);

  // フィルターが適用されているか
  const hasActiveFilters = useMemo(() => {
    return activeFilters.length > 0;
  }, [activeFilters]);

  return {
    // 状態
    filterOptions,
    setFilterOptions,
    priceRanges,
    setPriceRanges,
    selectedTags,
    setSelectedTags,
    selectedItems,
    setSelectedItems,
    showSelectedOnly,
    setShowSelectedOnly,
    
    // 機能
    addFilter,
    removeFilter,
    clearAllFilters,
    applyFilters,
    togglePriceRangeFilter,
    
    // 情報
    activeFilters,
    hasActiveFilters
  };
}; 