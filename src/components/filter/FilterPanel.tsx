import React from 'react';
import { Tag, CheckCircle2, X, ChevronUp, ChevronDown, Circle } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { FilterOptions, ProductTag } from '../../types';

interface FilterPanelProps {
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  filterKeyword: string;
  setFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newFilterKeyword: string;
  setNewFilterKeyword: React.Dispatch<React.SetStateAction<string>>;
  newExcludeKeyword: string;
  setNewExcludeKeyword: React.Dispatch<React.SetStateAction<string>>;
  showTags: boolean;
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTagFilter: (tagKeyword: string) => void;
  resetAllFilters: () => void;
  availableTags: { tag: ProductTag; count: number }[];
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  isTagsVisible: boolean;
  setIsTagsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  resultsCount: number;
  filteredResultsCount: number;
}

/**
 * フィルターパネルコンポーネント
 * 検索結果のフィルタリング機能を提供します
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  filterOptions,
  setFilterOptions,
  selectedTags,
  setSelectedTags,
  filterKeyword,
  setFilterKeyword,
  newFilterKeyword,
  setNewFilterKeyword,
  newExcludeKeyword,
  setNewExcludeKeyword,
  showTags,
  setShowTags,
  toggleTagFilter,
  resetAllFilters,
  availableTags,
  addFilterKeyword,
  addExcludeKeyword,
  isTagsVisible,
  setIsTagsVisible,
  resultsCount,
  filteredResultsCount
}) => {
  // キーワード追加ハンドラー
  const handleAddFilterKeyword = () => {
    if (newFilterKeyword.trim()) {
      setFilterOptions(prev => ({
        ...prev,
        filterKeywords: [...prev.filterKeywords, newFilterKeyword.trim()]
      }));
      setNewFilterKeyword('');
    }
  };

  // 除外キーワード追加ハンドラー
  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword.trim()) {
      setFilterOptions(prev => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword.trim()]
      }));
      setNewExcludeKeyword('');
    }
  };

  // フィルターキーワード削除ハンドラー
  const removeFilterKeyword = (index: number) => {
    setFilterOptions(prev => ({
      ...prev,
      filterKeywords: prev.filterKeywords.filter((_, i) => i !== index)
    }));
  };

  // 除外キーワード削除ハンドラー
  const removeExcludeKeyword = (index: number) => {
    setFilterOptions(prev => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      {/* フィルターパネルのヘッダー */}
      <button
        onClick={() => setIsTagsVisible(!isTagsVisible)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
      >
        <div className="flex items-center gap-1.5">
          <Tag size={16} />
          絞り込み
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            selectedTags.size > 0 || filterKeyword || filterOptions.excludeMultipleBids || filterOptions.excludeJunk || filterOptions.excludeSets || filterOptions.excludeNew
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {resultsCount.toLocaleString()}件
            {(selectedTags.size > 0 || filterKeyword || filterOptions.excludeMultipleBids || filterOptions.excludeJunk || filterOptions.excludeSets || filterOptions.excludeNew) && (
              <>
                <span className="mx-0.5">→</span>
                {filteredResultsCount.toLocaleString()}件
              </>
            )}
          </span>
        </div>
        {/* フィルタークリアボタン */}
        <div className="flex items-center gap-1.5">
          {(selectedTags.size > 0 || filterKeyword || filterOptions.excludeMultipleBids || filterOptions.excludeJunk || filterOptions.excludeSets) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetAllFilters();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-0.5"
            >
              <X size={14} />
              クリア
            </button>
          )}
          {isTagsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* フィルターコンテンツ */}
      {isTagsVisible && (
        <div className="space-y-4">
          {/* 含む系フィルター */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
              <div className="text-xs font-bold text-gray-600">含む</div>
            </div>

            {/* 含むキーワード入力 */}
            <div className="space-y-2">
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={newFilterKeyword}
                  onChange={(e) => setNewFilterKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFilterKeyword.trim()) {
                      handleAddFilterKeyword();
                    }
                  }}
                  placeholder="含むキーワード"
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
                />
                {newFilterKeyword && (
                  <button
                    onClick={handleAddFilterKeyword}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
              {/* 含むキーワードタグ */}
              {filterOptions.filterKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filterOptions.filterKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                    >
                      {keyword}
                      <button
                        onClick={() => removeFilterKeyword(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* タグ絞り込み */}
            <div className="space-y-2">
              <button
                onClick={() => setShowTags(!showTags)}
                className="flex items-center justify-end w-full text-xs text-gray-500 hover:text-gray-700"
              >
                タグで絞り込む
                {showTags ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </button>
              {showTags && availableTags.length > 0 && (
                <div className="space-y-2">
                  {(['状態', 'ジャンク', 'まとめ', '送料'] as const).map(group => {
                    const groupTags = availableTags.filter(({ tag }) => tag.group === group);
                    if (groupTags.length === 0) return null;

                    return (
                      <div key={group} className="bg-gray-100 rounded-md p-2">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{group}</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {groupTags.map(({ tag, count }) => (
                            <button
                              key={tag.keyword}
                              onClick={() => toggleTagFilter(tag.keyword)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                selectedTags.has(tag.keyword)
                                  ? `${tag.color} shadow-sm`
                                  : 'bg-white text-gray-700'
                              }`}
                            >
                              {selectedTags.has(tag.keyword) && (
                                <CheckCircle2 size={12} className="flex-shrink-0" />
                              )}
                              <span className="font-medium">{tag.label}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                                selectedTags.has(tag.keyword) 
                                  ? 'bg-white/80 text-gray-700' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 除外系フィルター */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
              <div className="text-xs font-bold text-gray-600">除外</div>
            </div>

            {/* 除外キーワード入力 */}
            <div className="space-y-2">
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={newExcludeKeyword}
                  onChange={(e) => setNewExcludeKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newExcludeKeyword.trim()) {
                      e.preventDefault();
                      handleAddExcludeKeyword();
                    }
                  }}
                  placeholder="除外キーワード"
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
                />
                {newExcludeKeyword && (
                  <button
                    onClick={handleAddExcludeKeyword}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
              {/* 除外キーワードタグ */}
              {filterOptions.excludeKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filterOptions.excludeKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs"
                    >
                      {keyword}
                      <button
                        onClick={() => removeExcludeKeyword(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 除外ボタン */}
            <div className="flex flex-wrap gap-1">
              <Tooltip text="「入札1」を除外">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeMultipleBids: !prev.excludeMultipleBids }))}
                  className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
                    filterOptions.excludeMultipleBids
                      ? 'bg-red-50 text-red-700 border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  入札1
                </button>
              </Tooltip>
              <Tooltip text="「ジャンク」「現状品」を除外">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeJunk: !prev.excludeJunk }))}
                  className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
                    filterOptions.excludeJunk
                      ? 'bg-red-50 text-red-700 border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ジャンク
                </button>
              </Tooltip>
              <Tooltip text="「まとめ」「セット」を除外">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeSets: !prev.excludeSets }))}
                  className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
                    filterOptions.excludeSets
                      ? 'bg-red-50 text-red-700 border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  まとめ
                </button>
              </Tooltip>
              <Tooltip text="「新品」「未使用」「未開封」を除外">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeNew: !prev.excludeNew }))}
                  className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
                    filterOptions.excludeNew
                      ? 'bg-red-50 text-red-700 border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  新品
                </button>
              </Tooltip>
              <Tooltip text="「送料無料」「送料込み」を除外">
                <button
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeFreeShipping: !prev.excludeFreeShipping }))}
                  className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
                    filterOptions.excludeFreeShipping
                      ? 'bg-red-50 text-red-700 border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  送料無料
                </button>
              </Tooltip>
            </div>
          </div>

          {/* フィルタークリアボタン */}
          <button
            onClick={resetAllFilters}
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

export default FilterPanel; 