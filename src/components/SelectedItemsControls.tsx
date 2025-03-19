import React from 'react';
import { CheckCircle2, Trash2, JapaneseYen } from 'lucide-react';
import { Statistics } from '../types';

interface SelectedItemsControlsProps {
  selectedCount: number;
  showSelectedOnly: boolean;
  onToggleSelectedOnly: () => void;
  onClearSelection: () => void;
  statistics: Statistics | null;
}

const SelectedItemsControls: React.FC<SelectedItemsControlsProps> = ({
  selectedCount,
  showSelectedOnly,
  onToggleSelectedOnly,
  onClearSelection,
  statistics
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1">
          <CheckCircle2 size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            {selectedCount}件選択中
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleSelectedOnly}
            className={`px-2 py-1 rounded text-xs ${
              showSelectedOnly
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showSelectedOnly ? '全て表示' : '選択のみ表示'}
          </button>
          <button
            onClick={onClearSelection}
            className="px-2 py-1 rounded text-xs bg-red-50 text-red-600 flex items-center gap-1"
          >
            <Trash2 size={12} />
            <span>クリア</span>
          </button>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <div className="bg-gray-50 rounded p-1.5">
            <div className="text-xs text-gray-500 mb-0.5">平均価格</div>
            <div className="flex items-center gap-0.5">
              <JapaneseYen size={14} className="text-gray-700" />
              <div className="text-sm font-bold text-gray-900">
                {Math.round(statistics.average).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-1.5">
            <div className="text-xs text-gray-500 mb-0.5">中央値</div>
            <div className="flex items-center gap-0.5">
              <JapaneseYen size={14} className="text-gray-700" />
              <div className="text-sm font-bold text-gray-900">
                {Math.round(statistics.median).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-1.5">
            <div className="text-xs text-gray-500 mb-0.5">最安値</div>
            <div className="flex items-center gap-0.5">
              <JapaneseYen size={14} className="text-gray-700" />
              <div className="text-sm font-bold text-gray-900">
                {statistics.min.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-1.5">
            <div className="text-xs text-gray-500 mb-0.5">最高値</div>
            <div className="flex items-center gap-0.5">
              <JapaneseYen size={14} className="text-gray-700" />
              <div className="text-sm font-bold text-gray-900">
                {statistics.max.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedItemsControls; 