import { useState } from 'react';
import { Tag, ChevronUp, ChevronDown, X } from 'lucide-react';
import { FilterOptions } from '../../types/filter';
import { AuctionItem } from '../../types/product';
import { TagFilter } from './TagFilter';
import { KeywordFilter } from './KeywordFilter';
import { ExcludeFilter } from './ExcludeFilter';

interface FilterPanelProps {
  results: AuctionItem[];
  filteredResults: AuctionItem[];
  filterOptions: FilterOptions;
  onChange: (options: Partial<FilterOptions>) => void;
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
  onReset: () => void;
}

/**
 * フィルタパネルコンポーネント
 * 様々なフィルタリングオプションを含む
 */
export const FilterPanel = ({ 
  results, 
  filteredResults, 
  filterOptions, 
  onChange, 
  selectedTags, 
  onTagToggle,
  onReset
}: FilterPanelProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const hasFilters = selectedTags.size > 0 || 
    filterOptions.excludeMultipleBids || 
    filterOptions.excludeJunk || 
    filterOptions.excludeSets || 
    filterOptions.excludeNew || 
    filterOptions.excludeKeywords.length > 0 || 
    filterOptions.filterKeywords.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
      >
        <div className="flex items-center gap-1.5">
          <Tag size={16} />
          絞り込み
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            hasFilters
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {results.length.toLocaleString()}件
            {hasFilters && (
              <>
                <span className="mx-0.5">→</span>
                {filteredResults.length.toLocaleString()}件
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
            >
              <X size={14} />
              クリア
            </button>
          )}
          {isVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      
      {isVisible && (
        <div className="space-y-4">
          {/* 含む系 */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
              <div className="text-xs font-bold text-gray-600">含む</div>
            </div>

            <KeywordFilter
              filterKeywords={filterOptions.filterKeywords}
              onChange={(filterKeywords) => onChange({ filterKeywords })}
            />
            
            <TagFilter
              results={results}
              selectedTags={selectedTags}
              onTagToggle={onTagToggle}
            />
          </div>

          {/* 除外系 */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
              <div className="text-xs font-bold text-gray-600">除外</div>
            </div>

            <ExcludeFilter
              excludeOptions={filterOptions}
              onChange={onChange}
            />
          </div>

          {/* クリアボタン */}
          <button
            onClick={onReset}
            className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <X size={14} />
            全ての絞り込みをクリア
          </button>
        </div>
      )}
    </div>
  );
}; 