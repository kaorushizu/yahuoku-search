import { useState, useCallback } from 'react';
import { AuctionItem } from '../types';

interface UseProductSelectionReturn {
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  toggleItemSelection: (id: string) => void;
  clearSelectedItems: () => void;
  handleItemSelection: (e: React.MouseEvent, id: string, items: AuctionItem[]) => void;
  handleSelectAll: (items: AuctionItem[]) => void;
  areAllSelected: (items: AuctionItem[]) => boolean;
}

export const useProductSelection = (): UseProductSelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setLastSelectedId(id);
  }, []);

  const clearSelectedItems = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedId(null);
  }, []);

  const handleItemSelection = useCallback((e: React.MouseEvent, id: string, items: AuctionItem[]) => {
    if (e.shiftKey && lastSelectedId && selectedItems.size > 0) {
      const currentIndex = items.findIndex(i => i.オークションID === id);
      const lastSelectedIndex = items.findIndex(i => i.オークションID === lastSelectedId);
      
      if (currentIndex >= 0 && lastSelectedIndex >= 0) {
        const start = Math.min(currentIndex, lastSelectedIndex);
        const end = Math.max(currentIndex, lastSelectedIndex);
        const newSelectedItems = new Set(selectedItems);
        
        // 範囲内の全ての項目を選択
        for (let i = start; i <= end; i++) {
          newSelectedItems.add(items[i].オークションID);
        }
        
        setSelectedItems(newSelectedItems);
      }
    } else {
      toggleItemSelection(id);
    }
  }, [selectedItems, lastSelectedId, toggleItemSelection]);

  const handleSelectAll = useCallback((items: AuctionItem[]) => {
    if (items.length === 0) return;
    
    const allSelected = items.every(item => selectedItems.has(item.オークションID));
    
    if (allSelected) {
      clearSelectedItems();
    } else {
      setSelectedItems(new Set(items.map(item => item.オークションID)));
    }
  }, [selectedItems, clearSelectedItems]);

  const areAllSelected = useCallback((items: AuctionItem[]) => {
    if (items.length === 0) return false;
    return items.every(item => selectedItems.has(item.オークションID));
  }, [selectedItems]);

  return {
    selectedItems,
    setSelectedItems,
    toggleItemSelection,
    clearSelectedItems,
    handleItemSelection,
    handleSelectAll,
    areAllSelected
  };
};

export default useProductSelection; 