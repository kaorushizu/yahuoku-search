import React from 'react';
import { Package2 } from 'lucide-react';
import { LayoutType, SortOrder } from '../types';
import LayoutSwitch from './LayoutSwitch';
import SortButton from './SortButton';

interface ResultControlsProps {
  totalCount: number;
  filteredCount: number;
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

const ResultControls: React.FC<ResultControlsProps> = ({
  totalCount,
  filteredCount,
  layout,
  onLayoutChange,
  sortOrder,
  onSortChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white rounded-lg shadow p-3">
      <div className="text-sm text-gray-600">
        <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span>
        <span className="mx-1">件中</span>
        <span className="font-bold text-gray-900">{filteredCount.toLocaleString()}</span>
        <span className="mx-1">件表示</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Package2 size={16} />
          <span>{filteredCount.toLocaleString()}件</span>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {/* レイアウト切り替えボタン */}
          <LayoutSwitch layout={layout} onLayoutChange={onLayoutChange} />
          
          {/* ソートボタン */}
          <SortButton sortOrder={sortOrder} onSortChange={onSortChange} />
        </div>
      </div>
    </div>
  );
};

export default ResultControls; 