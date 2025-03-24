import React, { createContext, useContext, ReactNode } from 'react';
import { useItemSelection, useStatistics } from '../hooks';
import { AuctionItem, Statistics } from '../types';
import { useSearch } from './SearchContext';
import { useFilter } from './FilterContext';

// コンテキストの型定義
interface SelectionContextType {
  // 選択状態
  selectedItems: Set<string>;
  setSelectedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  showSelectedOnly: boolean;
  setShowSelectedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  hideSelectedItems: boolean;
  setHideSelectedItems: React.Dispatch<React.SetStateAction<boolean>>;
  
  // 選択機能
  toggleItemSelection: (id: string) => void;
  clearSelectedItems: () => void;
  handleRangeSelection: (id: string, items: AuctionItem[], isTable: boolean) => void;
  toggleSelectAll: (items: AuctionItem[]) => void;
  
  // 統計情報
  selectedStatistics: Statistics | null;
}

// コンテキストの作成
const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface SelectionProviderProps {
  children: ReactNode;
}

export const SelectionProvider: React.FC<SelectionProviderProps> = ({ children }) => {
  // SearchContextから結果を取得
  const { results } = useSearch();
  
  // FilterContextからフィルタリング結果を取得
  const { filteredResults } = useFilter();
  
  // useItemSelectionフックを使用
  const itemSelection = useItemSelection();
  
  // 選択されたアイテムの統計情報を計算
  const selectedStatistics = useStatistics(
    results.filter(item => itemSelection.selectedItems.has(item.オークションID))
  );
  
  // コンテキスト値の作成
  const contextValue: SelectionContextType = {
    selectedItems: itemSelection.selectedItems,
    setSelectedItems: itemSelection.setSelectedItems,
    showSelectedOnly: itemSelection.showSelectedOnly,
    setShowSelectedOnly: itemSelection.setShowSelectedOnly,
    hideSelectedItems: itemSelection.hideSelectedItems,
    setHideSelectedItems: itemSelection.setHideSelectedItems,
    toggleItemSelection: itemSelection.toggleItemSelection,
    clearSelectedItems: itemSelection.clearSelectedItems,
    handleRangeSelection: itemSelection.handleRangeSelection,
    toggleSelectAll: itemSelection.toggleSelectAll,
    selectedStatistics
  };

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
};

// カスタムフック
export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export default SelectionContext; 