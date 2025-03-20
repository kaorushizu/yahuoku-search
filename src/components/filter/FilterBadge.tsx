import React from 'react';
import { X } from 'lucide-react';
import { FilterType } from '../../hooks/useFilterSystem';

interface FilterBadgeProps {
  type: FilterType;
  label: string;
  onRemove: () => void;
}

const FilterBadge: React.FC<FilterBadgeProps> = ({ type, label, onRemove }) => {
  // フィルタータイプに応じた色・スタイルを設定
  const getStyleByType = (): { bg: string; text: string; border: string } => {
    switch (type) {
      case 'price':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'keyword':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      case 'exclude':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'tag':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      case 'condition':
        return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' };
      case 'shipping':
        return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' };
      case 'selection':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const { bg, text, border } = getStyleByType();

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded text-xs ${bg} ${text} border ${border}`}>
      <span>{label}</span>
      <button
        onClick={onRemove}
        className={`ml-1 p-0.5 rounded-full hover:${bg} opacity-70 hover:opacity-100`}
        aria-label="フィルターを削除"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default FilterBadge; 