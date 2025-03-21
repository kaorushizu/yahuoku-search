import React from 'react';

interface PriceRange {
  min: number;
  max: number;
  range: string;
}

interface PriceRangeFiltersProps {
  selectedPriceRanges: PriceRange[];
  setSelectedPriceRanges: React.Dispatch<React.SetStateAction<PriceRange[]>>;
  clearAllPriceRangeFilters: () => void;
  filteredResultsCount: number;
  totalResultsCount: number;
}

/**
 * 価格範囲フィルターの表示と管理を行うコンポーネント
 */
const PriceRangeFilters: React.FC<PriceRangeFiltersProps> = ({
  selectedPriceRanges,
  setSelectedPriceRanges,
  clearAllPriceRangeFilters,
  filteredResultsCount,
  totalResultsCount
}) => {
  if (selectedPriceRanges.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-blue-800">
          価格範囲フィルター
        </div>
        <button 
          onClick={clearAllPriceRangeFilters}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          すべてクリア
        </button>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedPriceRanges.map((range, index) => (
          <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {range.max === Number.MAX_SAFE_INTEGER 
              ? `¥${range.min.toLocaleString()}以上` 
              : `¥${range.min.toLocaleString()}～¥${range.max.toLocaleString()}`}
            <button 
              className="ml-1 text-blue-600 hover:text-blue-800"
              onClick={() => {
                setSelectedPriceRanges(prev => 
                  prev.filter((_, i) => i !== index)
                );
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="text-xs text-blue-600">
        {filteredResultsCount}件表示 ({totalResultsCount}件中)
      </div>
    </div>
  );
};

export default PriceRangeFilters; 