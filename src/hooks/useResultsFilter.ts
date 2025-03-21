import { useMemo } from 'react';
import { AuctionItem, FilterOptions, SortOrder, ProductTag } from '../types';

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
 * @returns フィルタリングおよびソートされた商品の配列
 */
export const useResultsFilter = (
  results: AuctionItem[],
  filterOptions: FilterOptions,
  sortOrder: SortOrder,
  selectedItems: Set<string>,
  showSelectedOnly: boolean,
  selectedTags: Set<string>,
  getProductTags: (title: string) => ProductTag[]
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
        !item.商品名.toLowerCase().includes('未使用') &&
        !item.商品名.toLowerCase().includes('未開封')
      );
    }

    // 送料無料商品のフィルター
    if (filterOptions.excludeFreeShipping) {
      filtered = filtered.filter(item => 
        !item.商品名.toLowerCase().includes('送料無料') && 
        !item.商品名.toLowerCase().includes('送料込')
      );
    }

    // 価格によるソート
    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.落札金額 - b.落札金額;
        } else {
          return b.落札金額 - a.落札金額;
        }
      });
    }

    return filtered;
  }, [
    results,
    filterOptions,
    sortOrder,
    selectedItems,
    showSelectedOnly,
    selectedTags,
    getProductTags
  ]);
}; 