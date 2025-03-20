import React from 'react';
import { X } from 'lucide-react';
import { Statistics } from '../../types';

interface SelectedItemsPanelProps {
  selectedStatistics: Statistics;
  selectedItemsCount: number;
  clearSelectedItems: () => void;
  showSelectedOnly: boolean;
  setShowSelectedOnly: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * 選択された商品の統計情報パネルコンポーネント
 * 選択された商品の統計情報を表示し、選択のみ表示するオプションを提供
 */
const SelectedItemsPanel: React.FC<SelectedItemsPanelProps> = ({
  selectedStatistics,
  selectedItemsCount,
  clearSelectedItems,
  showSelectedOnly,
  setShowSelectedOnly
}) => {
  if (selectedItemsCount === 0) return null;

  return (
    <div className="fixed top-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full transition-all duration-300 z-50">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">選択した商品の統計</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedItemsCount}件</span>
            <button
              onClick={clearSelectedItems}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              title="選択をクリア"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* 選択商品の統計値表示 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-100 rounded-md p-2">
            <div className="text-sm text-gray-600 mb-0.5">中央値</div>
            <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.median.toLocaleString()}</div>
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
      {/* 選択商品表示切替ボタン */}
      <button
        onClick={() => setShowSelectedOnly(!showSelectedOnly)}
        className={`w-full px-3 py-2 rounded text-sm font-medium ${
          showSelectedOnly
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {showSelectedOnly ? '全ての商品を表示' : '選択した商品のみ表示'}
      </button>
    </div>
  );
};

export default SelectedItemsPanel; 