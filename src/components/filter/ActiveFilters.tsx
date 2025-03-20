import React from 'react';
import FilterBadge from './FilterBadge';
import { FilterInfo, FilterType } from '../../hooks/useFilterSystem';

interface ActiveFiltersProps {
  filters: FilterInfo[];
  onRemoveFilter: (type: FilterType, id: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll
}) => {
  if (filters.length === 0) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">アクティブなフィルター</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          すべてクリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterBadge
            key={filter.id}
            type={filter.type}
            label={filter.label}
            onRemove={() => onRemoveFilter(filter.type, filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters; 