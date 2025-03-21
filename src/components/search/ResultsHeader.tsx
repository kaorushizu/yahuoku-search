import React from 'react';
import { ArrowUpDown, ArrowDownNarrowWide, ArrowUpNarrowWide, CheckSquare, Square } from 'lucide-react';
import { SortOrder } from '../../types';

interface ResultsHeaderProps {
  layout: 'grid' | 'table';
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  selectedItemsCount: number;
  totalItemsCount: number;
  toggleSelectAll: () => void;
  hasSelectedItems: boolean;
  clearSelectedItems: () => void;
}

/**
 * 検索結果のヘッダーコンポーネント
 * ソート順、表示形式の切り替え、アイテム選択コントロールなどを含む
 */
const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  layout,
  sortOrder,
  setSortOrder,
  setLayout,
  selectedItemsCount,
  totalItemsCount,
  toggleSelectAll,
  hasSelectedItems,
  clearSelectedItems
}) => {
  // ソート順を循環させるハンドラー
  const handleToggleSortOrder = () => {
    if (sortOrder === 'none') {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder('none');
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1.5">
        {/* 選択/選択解除ボタン */}
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title={hasSelectedItems ? "すべて選択解除" : "すべて選択"}
        >
          {hasSelectedItems ? <CheckSquare size={14} /> : <Square size={14} />}
          <span className="hidden sm:inline">
            {selectedItemsCount > 0
              ? `${selectedItemsCount}件選択中`
              : "選択"}
          </span>
        </button>
        
        {/* 選択解除ボタン（選択中のみ表示） */}
        {selectedItemsCount > 0 && (
          <button
            onClick={clearSelectedItems}
            className="px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="選択解除"
          >
            解除
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 並び替えボタン */}
        <button
          onClick={handleToggleSortOrder}
          className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            sortOrder !== 'none'
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="価格で並び替え"
        >
          {sortOrder === 'none' && <ArrowUpDown size={14} />}
          {sortOrder === 'asc' && <ArrowUpNarrowWide size={14} />}
          {sortOrder === 'desc' && <ArrowDownNarrowWide size={14} />}
          <span className="hidden sm:inline">
            {sortOrder === 'none' && "並び替え"}
            {sortOrder === 'asc' && "安い順"}
            {sortOrder === 'desc' && "高い順"}
          </span>
        </button>

        {/* 表示件数 */}
        <div className="text-xs text-gray-500 hidden sm:block">
          {totalItemsCount}件
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader; 