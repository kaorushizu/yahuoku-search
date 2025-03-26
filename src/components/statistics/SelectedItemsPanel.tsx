import React from 'react';
import { X, EyeOff, Eye, Trash2 } from 'lucide-react';
import { Statistics, AuctionItem } from '../../types';

interface SelectedItemsPanelProps {
  selectedStatistics: Statistics;
  selectedItems: Set<string>;
  clearSelectedItems: () => void;
  showSelectedOnly: boolean;
  setShowSelectedOnly: React.Dispatch<React.SetStateAction<boolean>>;
  hideSelectedItems: boolean;
  setHideSelectedItems: React.Dispatch<React.SetStateAction<boolean>>;
  toggleItemSelection: (id: string) => void;
  filteredResults: AuctionItem[];
  getAuctionUrl: (id: string, endDate: string) => string;
}

/**
 * 選択された商品の統計情報パネルコンポーネント
 * 選択された商品の統計情報を表示し、選択の表示/非表示を切り替えるオプションを提供
 */
const SelectedItemsPanel: React.FC<SelectedItemsPanelProps> = ({
  selectedStatistics,
  selectedItems,
  clearSelectedItems,
  showSelectedOnly,
  setShowSelectedOnly,
  hideSelectedItems,
  setHideSelectedItems,
  toggleItemSelection,
  filteredResults,
  getAuctionUrl
}) => {
  if (selectedItems.size === 0) return null;

  // 表示モードの切り替え
  const handleShowHideToggle = React.useCallback((mode: 'show' | 'hide' | 'all') => {
    if (mode === 'show') {
      setShowSelectedOnly(true);
      setHideSelectedItems(false);
    } else if (mode === 'hide') {
      setHideSelectedItems(true);
      setShowSelectedOnly(false);
    } else {
      setShowSelectedOnly(false);
      setHideSelectedItems(false);
    }
  }, [setShowSelectedOnly, setHideSelectedItems]);

  // 現在の選択モードに基づくラベルとアイコンを計算
  const showButtonLabel = React.useMemo(() => {
    return showSelectedOnly ? '全て表示' : '選択のみ表示';
  }, [showSelectedOnly]);

  const hideButtonLabel = React.useMemo(() => {
    return hideSelectedItems ? '全て表示' : '選択を非表示';
  }, [hideSelectedItems]);

  return (
    <div className="fixed top-20 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full transition-all duration-300 z-50">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">選択した商品の統計</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedItems.size}件</span>
            <button
              onClick={() => clearSelectedItems()}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              title="選択をクリア"
              aria-label="選択したアイテムをすべてクリア"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* 選択商品の統計値表示 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm text-gray-600 mb-0.5">中央値</div>
            <div className="font-bold text-gray-900 text-lg">¥{Math.round(selectedStatistics.median).toLocaleString()}</div>
          </div>
          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm text-gray-600 mb-0.5">平均価格</div>
            <div className="font-bold text-gray-900 text-lg">¥{Math.round(selectedStatistics.average).toLocaleString()}</div>
          </div>
          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm text-gray-600 mb-0.5">最高値</div>
            <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.max.toLocaleString()}</div>
          </div>
          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm text-gray-600 mb-0.5">最安値</div>
            <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.min.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 表示切替ボタン */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleShowHideToggle(showSelectedOnly ? 'all' : 'show')}
          className={`flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium ${
            showSelectedOnly
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={showSelectedOnly}
          title={showSelectedOnly ? '全てのアイテムを表示' : '選択したアイテムのみ表示'}
        >
          <Eye size={16} />
          {showButtonLabel}
        </button>
        <button
          onClick={() => handleShowHideToggle(hideSelectedItems ? 'all' : 'hide')}
          className={`flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium ${
            hideSelectedItems
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={hideSelectedItems}
          title={hideSelectedItems ? '全てのアイテムを表示' : '選択したアイテムを非表示'}
        >
          <EyeOff size={16} />
          {hideButtonLabel}
        </button>
      </div>
      
      {/* 選択解除ボタン */}
      <button
        onClick={clearSelectedItems}
        className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-2 rounded text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
        aria-label="選択したアイテムをすべて解除"
      >
        <Trash2 size={16} />
        選択を解除
      </button>
    </div>
  );
};

export default SelectedItemsPanel; 