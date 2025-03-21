import { useState, useCallback, useMemo } from 'react';
import { AuctionItem, FilterOptions, ProductTag } from '../types';

/**
 * フィルタータイプの定義
 * アプリケーション内で使用される様々なフィルターの種類を表す
 */
export type FilterType = 
  | 'price'      // 価格範囲
  | 'keyword'    // キーワード（含む）
  | 'exclude'    // 除外キーワード 
  | 'tag'        // タグ
  | 'condition'  // 状態（新品/中古/ジャンクなど）
  | 'shipping'   // 送料
  | 'selection'; // 選択された商品

/**
 * 価格範囲フィルターの型定義
 */
export interface PriceRange {
  min: number;    // 最小価格
  max: number;    // 最大価格
  label: string;  // 表示ラベル
}

/**
 * フィルター情報の型定義
 * UI表示および内部処理に使用
 */
export interface FilterInfo {
  type: FilterType;  // フィルタータイプ
  label: string;     // 表示ラベル
  value: any;        // フィルター値
  id: string;        // 一意の識別子
}

/**
 * 統合フィルターシステムを提供するカスタムフック
 * すべてのフィルタリング機能を一元管理
 * 
 * @param getProductTags - 商品名からタグを抽出する関数
 * @returns フィルター関連の状態と機能
 */
export const useFilterSystem = (
  getProductTags: (title: string) => ProductTag[]
) => {
  // 基本フィルターオプション
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    filterKeywords: [],      // 含むキーワード
    excludeKeywords: [],     // 除外キーワード
    excludeJunk: false,      // ジャンク品除外
    excludeMultipleBids: false, // 入札多数の商品除外
    excludeNew: false,       // 新品除外
    excludeSets: false,      // セット商品除外
    excludeFreeShipping: false, // 送料無料商品除外
    selectedTags: [],        // 選択されたタグ
  });

  // 価格範囲フィルター
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  
  // タグフィルター（Set型で重複を防止）
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  // 選択商品フィルター
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  /**
   * 現在アクティブなフィルターを生成
   * UI表示用のフィルター情報の配列を作成
   */
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
    
    // キーワードフィルター（含む）
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
    
    // その他のフィルター（チェックボックス系）
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

  /**
   * フィルターを追加する関数
   * @param type - フィルタータイプ
   * @param value - フィルター値
   */
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

  /**
   * フィルターを削除する関数
   * @param type - フィルタータイプ
   * @param id - フィルターID
   */
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

  /**
   * すべてのフィルターをクリアする関数
   */
  const clearAllFilters = useCallback(() => {
    setFilterOptions({
      filterKeywords: [],
      excludeKeywords: [],
      excludeJunk: false,
      excludeMultipleBids: false,
      excludeNew: false,
      excludeSets: false,
      excludeFreeShipping: false,
      selectedTags: [],
    });
    setPriceRanges([]);
    setSelectedTags(new Set());
    setShowSelectedOnly(false);
  }, []);

  /**
   * 価格範囲フィルターを切り替える関数
   * @param rangeStart - 開始価格
   * @param rangeEnd - 終了価格
   * @param rangeText - 表示テキスト
   */
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

  /**
   * タグフィルターの切り替え関数
   * @param tagKeyword - タグのキーワード
   */
  const toggleTagFilter = useCallback((tagKeyword: string) => {
    console.log('タグ切り替え:', tagKeyword);
    console.log('切り替え前のタグ:', [...selectedTags]);

    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagKeyword)) {
        newSet.delete(tagKeyword);
      } else {
        newSet.add(tagKeyword);
      }
      console.log('切り替え後のタグ:', [...newSet]);
      return newSet;
    });
    
    // filterOptionsのselectedTagsも更新
    setFilterOptions(prev => {
      const updatedTags = [...prev.selectedTags];
      const tagIndex = updatedTags.indexOf(tagKeyword);
      
      if (tagIndex >= 0) {
        updatedTags.splice(tagIndex, 1);
      } else {
        updatedTags.push(tagKeyword);
      }
      
      console.log('更新後のfilterOptions.selectedTags:', updatedTags);
      return {
        ...prev,
        selectedTags: updatedTags
      };
    });
  }, []);

  /**
   * すべてのフィルター条件を適用する関数
   * @param itemsToFilter - フィルタリング対象の商品配列
   * @returns フィルタリング後の商品配列
   */
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
    
    // キーワードフィルター（含む）
    if (filterOptions.filterKeywords.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const title = item.商品名.toLowerCase();
        return filterOptions.filterKeywords.every(keyword => 
          title.includes(keyword.toLowerCase())
        );
      });
    }
    
    // 除外キーワード
    if (filterOptions.excludeKeywords.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const title = item.商品名.toLowerCase();
        return !filterOptions.excludeKeywords.some(keyword => 
          title.includes(keyword.toLowerCase())
        );
      });
    }
    
    // タグフィルター
    if (selectedTags.size > 0) {
      console.log('フィルタリング適用中のタグ:', [...selectedTags]);
      filteredItems = filteredItems.filter(item => {
        const itemTags = getProductTags(item.商品名);
        const result = itemTags.some(tag => selectedTags.has(tag.keyword));
        return result;
      });
    }
    
    // 選択商品フィルター
    if (showSelectedOnly) {
      filteredItems = filteredItems.filter(item => selectedItems.has(item.オークションID));
    }
    
    // その他のフィルター（ジャンク品、新品、入札多数など）
    if (filterOptions.excludeJunk) {
      filteredItems = filteredItems.filter(item => 
        !item.商品名.toLowerCase().includes('ジャンク') &&
        !item.商品名.toLowerCase().includes('現状品')
      );
    }
    
    if (filterOptions.excludeNew) {
      filteredItems = filteredItems.filter(item => 
        !item.商品名.toLowerCase().includes('新品') &&
        !item.商品名.toLowerCase().includes('未使用') &&
        !item.商品名.toLowerCase().includes('未開封')
      );
    }
    
    if (filterOptions.excludeMultipleBids) {
      filteredItems = filteredItems.filter(item => item.入札数 >= 2);
    }
    
    if (filterOptions.excludeSets) {
      filteredItems = filteredItems.filter(item => 
        !item.商品名.toLowerCase().includes('まとめ') &&
        !item.商品名.toLowerCase().includes('セット')
      );
    }
    
    if (filterOptions.excludeFreeShipping) {
      filteredItems = filteredItems.filter(item => 
        !item.商品名.toLowerCase().includes('送料無料') &&
        !item.商品名.toLowerCase().includes('送料込')
      );
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

  /**
   * フィルターが適用されているかどうかを確認
   */
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
    toggleTagFilter,
    
    // 情報
    activeFilters,
    hasActiveFilters
  };
}; 