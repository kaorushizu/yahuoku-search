import React from 'react';
import { Plus, X, Search, Tag } from 'lucide-react';
import { FilterOptions, TagCount } from '../types';
import Tooltip from './Tooltip';

interface FilterPanelProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  newFilterKeyword: string;
  setNewFilterKeyword: (keyword: string) => void;
  newExcludeKeyword: string;
  setNewExcludeKeyword: (keyword: string) => void;
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  selectedTags: Set<string>;
  toggleTagFilter: (keyword: string) => void;
  availableTags: TagCount[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  setFilterOptions,
  newFilterKeyword,
  setNewFilterKeyword,
  newExcludeKeyword,
  setNewExcludeKeyword,
  addFilterKeyword,
  addExcludeKeyword,
  selectedTags,
  toggleTagFilter,
  availableTags
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4 overflow-y-auto scrollbar-auto-hide">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-1">
            <Search size={16} /> キーワード絞り込み
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={newFilterKeyword}
              onChange={(e) => setNewFilterKeyword(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="追加キーワード"
            />
            <button
              onClick={addFilterKeyword}
              disabled={!newFilterKeyword.trim()}
              className="p-1.5 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {filterOptions.filterKeywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 text-xs rounded px-2 py-1 flex items-center"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => {
                    setFilterOptions({
                      ...filterOptions,
                      filterKeywords: filterOptions.filterKeywords.filter((_, i) => i !== index)
                    });
                  }}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-1">
            <X size={16} /> 除外キーワード
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex gap-1">
            <input
              type="text"
              value={newExcludeKeyword}
              onChange={(e) => setNewExcludeKeyword(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded"
              placeholder="除外キーワード"
            />
            <button
              onClick={addExcludeKeyword}
              disabled={!newExcludeKeyword.trim()}
              className="p-1.5 bg-red-500 text-white rounded disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {filterOptions.excludeKeywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-red-100 text-red-800 text-xs rounded px-2 py-1 flex items-center"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => {
                    setFilterOptions({
                      ...filterOptions,
                      excludeKeywords: filterOptions.excludeKeywords.filter((_, i) => i !== index)
                    });
                  }}
                  className="ml-1 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-700 flex items-center gap-1">
            <Tag size={16} /> 商品タグ
          </h3>
          <span className="text-xs text-gray-500">{availableTags.length}種類</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {availableTags.map(({ tag, count }) => (
            <Tooltip key={tag.keyword} text={`${count}件`}>
              <button
                onClick={() => toggleTagFilter(tag.keyword)}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedTags.has(tag.keyword)
                    ? tag.color
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag.label}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter_multiple_bids"
            checked={filterOptions.excludeMultipleBids}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              excludeMultipleBids: e.target.checked
            })}
            className="rounded text-blue-600 focus:ring-blue-500 mr-2"
          />
          <label htmlFor="filter_multiple_bids" className="text-sm text-gray-700">
            複数入札のみ表示
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter_no_junk"
            checked={filterOptions.excludeJunk}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              excludeJunk: e.target.checked
            })}
            className="rounded text-blue-600 focus:ring-blue-500 mr-2"
          />
          <label htmlFor="filter_no_junk" className="text-sm text-gray-700">
            ジャンクを除外
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter_no_sets"
            checked={filterOptions.excludeSets}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              excludeSets: e.target.checked
            })}
            className="rounded text-blue-600 focus:ring-blue-500 mr-2"
          />
          <label htmlFor="filter_no_sets" className="text-sm text-gray-700">
            まとめ売りを除外
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="filter_no_new"
            checked={filterOptions.excludeNew}
            onChange={(e) => setFilterOptions({
              ...filterOptions,
              excludeNew: e.target.checked
            })}
            className="rounded text-blue-600 focus:ring-blue-500 mr-2"
          />
          <label htmlFor="filter_no_new" className="text-sm text-gray-700">
            新品を除外
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 