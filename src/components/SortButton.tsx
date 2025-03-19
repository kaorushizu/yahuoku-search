import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { SortOrder } from '../types';

interface SortButtonProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

const SortButton: React.FC<SortButtonProps> = ({
  sortOrder,
  onSortChange
}) => {
  const handleClick = () => {
    if (sortOrder === 'none') onSortChange('asc');
    else if (sortOrder === 'asc') onSortChange('desc');
    else onSortChange('none');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
        sortOrder === 'none' 
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {sortOrder === 'asc' ? (
        <ArrowUp size={14} />
      ) : sortOrder === 'desc' ? (
        <ArrowDown size={14} />
      ) : (
        <ArrowUpDown size={14} />
      )}
      {sortOrder === 'none' ? '価格順' : sortOrder === 'asc' ? '価格: 安い順' : '価格: 高い順'}
    </button>
  );
};

export default SortButton; 