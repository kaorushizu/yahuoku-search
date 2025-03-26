import { useMemo } from 'react';
import { AuctionItem, FilterOptions, SortOrder, ProductTag } from '../types';

// 価格範囲の型定義（FilterSystem互換）
export interface PriceRange {
  min: number;
  max: number;
  label: string;
}

/**
 * 検索結果をフィルタリングするカスタムフック
 * 複数の条件に基づいて商品をフィルタリングする
 * 
 * @param results - フィルタリングする商品の配列
 * @param filterOptions - フィルタリングオプション
 * @param sortOrder - ソート順（価格の昇順/降順）
 * @param selectedItems - 選択されたアイテムのID
 * @param showSelectedOnly - 選択されたアイテムのみ表示するかどうか
 * @param selectedTags - 選択されたタグ
 * @param getProductTags - 商品名からタグを抽出する関数
 * @param priceRanges - 価格範囲フィルター
 * @returns フィルタリングおよびソートされた商品の配列
 */
export const useResultsFilter = (
  results: AuctionItem[],
  filterOptions: FilterOptions,
  sortOrder: SortOrder,
  selectedItems: Set<string>,
  showSelectedOnly: boolean,
  selectedTags: Set<string>,
  getProductTags: (title: string) => ProductTag[],
  priceRanges: PriceRange[] = []
) => {
  /**
   * フィルタリングとソートを適用した結果を返す
   */
  return useMemo(() => {
    // パフォーマンス最適化のため、初期ステップでフィルタリングが不要な場合はすぐに結果を返す
    const noFiltersApplied = (
      !showSelectedOnly && 
      selectedTags.size === 0 && 
      !filterOptions.excludeJunk && 
      !filterOptions.excludeMultipleBids && 
      !filterOptions.excludeNew && 
      !filterOptions.excludeSets && 
      !filterOptions.excludeFreeShipping && 
      filterOptions.filterKeywords.length === 0 && 
      filterOptions.excludeKeywords.length === 0 && 
      priceRanges.length === 0 &&
      sortOrder === 'none'
    );
    
    if (noFiltersApplied && results.length > 0) {
      return results;
    }
    
    // コピーを作成してから処理を行う
    let filtered = [...results];

    // 選択された商品のみを表示するフィルター
    if (showSelectedOnly) {
      filtered = filtered.filter(item => selectedItems.has(item.オークションID));
    }

    // 価格範囲フィルター
    if (priceRanges.length > 0) {
      console.log('Applying price range filters:', priceRanges);
      filtered = filtered.filter(item => {
        const price = item.落札金額;
        return priceRanges.some(range => {
          // 最大値が設定されていない場合は上限なしとして扱う
          const isWithinRange = price >= range.min && 
              (range.max === Number.MAX_SAFE_INTEGER || price < range.max);
          return isWithinRange;
        });
      });
      console.log(`After price filtering: ${filtered.length} items left`);
    }

    // タグによるフィルタリング
    if (selectedTags.size > 0) {
      filtered = filtered.filter(item => {
        const itemTags = getProductTags(item.商品名);
        return itemTags.some(tag => selectedTags.has(tag.keyword));
      });
    }

    // キーワードによるフィルタリング（含む - AND条件）
    if (filterOptions.filterKeywords.length > 0) {
      filtered = filtered.filter(item => 
        filterOptions.filterKeywords.every(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // キーワードによるフィルタリング（除外）
    if (filterOptions.excludeKeywords.length > 0) {
      filtered = filtered.filter(item => 
        !filterOptions.excludeKeywords.some(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // 複数入札のフィルター
    if (filterOptions.excludeMultipleBids) {
      filtered = filtered.filter(item => item.入札数 >= 2);
    }

    // ジャンク品のフィルター
    if (filterOptions.excludeJunk) {
      filtered = filtered.filter(item => 
        !item.商品名.toLowerCase().includes('ジャンク') && 
        !item.商品名.toLowerCase().includes('現状品')
      );
    }

    // セット商品のフィルター
    if (filterOptions.excludeSets) {
      filtered = filtered.filter(item => 
        !item.商品名.toLowerCase().includes('まとめ') && 
        !item.商品名.toLowerCase().includes('セット')
      );
    }

    // 新品商品のフィルター
    if (filterOptions.excludeNew) {
      filtered = filtered.filter(item => 
        !item.商品名.toLowerCase().includes('新品') && 
        !item.商品名.toLowerCase().includes('未開封') && 
        !item.商品名.toLowerCase().includes('未使用')
      );
    }

    // 送料無料商品のフィルター
    if (filterOptions.excludeFreeShipping) {
      filtered = filtered.filter(item => 
        !item.商品名.toLowerCase().includes('送料無料') && 
        !item.商品名.toLowerCase().includes('送料込')
      );
    }

    // ソート処理
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.落札金額 - b.落札金額;
        } else if (sortOrder === 'desc') {
          return b.落札金額 - a.落札金額;
        }
        return 0;
      });
    }

    return filtered;
  }, [results, filterOptions, sortOrder, selectedItems, showSelectedOnly, selectedTags, getProductTags, priceRanges]);
}; 