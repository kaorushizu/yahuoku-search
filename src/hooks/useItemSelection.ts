import { useState } from 'react';
import { AuctionItem } from '../types';

/**
 * 商品選択機能を提供するカスタムフック
 */
export const useItemSelection = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [hideSelectedItems, setHideSelectedItems] = useState(false);

  /**
   * 商品の選択状態を切り替える関数
   * @param id - オークションID
   */
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  /**
   * 選択した商品をクリアする関数
   */
  const clearSelectedItems = () => {
    setSelectedItems(new Set());
    if (showSelectedOnly) {
      setShowSelectedOnly(false);
    }
    if (hideSelectedItems) {
      setHideSelectedItems(false);
    }
  };

  /**
   * シフトキーを使った範囲選択
   * @param currentId - 現在選択しようとしているアイテムのID
   * @param items - 全アイテムの配列
   * @param isShiftKeyPressed - シフトキーが押されているかどうか
   */
  const handleRangeSelection = (currentId: string, items: AuctionItem[], isShiftKeyPressed: boolean) => {
    if (isShiftKeyPressed && selectedItems.size > 0) {
      const currentIndex = items.findIndex(i => i.オークションID === currentId);
      const lastSelectedIndex = items.findIndex(i => i.オークションID === Array.from(selectedItems)[selectedItems.size - 1]);
      
      if (currentIndex === -1 || lastSelectedIndex === -1) return;
      
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      const newSelectedItems = new Set(selectedItems);
      
      // 範囲内の全ての項目を選択
      for (let i = start; i <= end; i++) {
        newSelectedItems.add(items[i].オークションID);
      }
      
      setSelectedItems(newSelectedItems);
    } else {
      toggleItemSelection(currentId);
    }
  };

  /**
   * 全てのアイテムの選択状態を切り替える
   * @param items - 全アイテムの配列
   */
  const toggleSelectAll = (items: AuctionItem[]) => {
    if (selectedItems.size === items.length) {
      clearSelectedItems();
    } else {
      setSelectedItems(new Set(items.map(item => item.オークションID)));
    }
  };

  return {
    selectedItems,
    setSelectedItems,
    showSelectedOnly,
    setShowSelectedOnly,
    toggleItemSelection,
    clearSelectedItems,
    handleRangeSelection,
    toggleSelectAll,
    hideSelectedItems,
    setHideSelectedItems,
  };
}; 