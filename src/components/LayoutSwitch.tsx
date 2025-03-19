import React from 'react';
import { LayoutType } from '../types';

interface LayoutSwitchProps {
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

const LayoutSwitch: React.FC<LayoutSwitchProps> = ({
  layout,
  onLayoutChange
}) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => onLayoutChange('grid')}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
          layout === 'grid'
            ? 'bg-white text-gray-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        グリッド
      </button>
      <button
        onClick={() => onLayoutChange('table')}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
          layout === 'table'
            ? 'bg-white text-gray-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        テーブル
      </button>
    </div>
  );
};

export default LayoutSwitch; 