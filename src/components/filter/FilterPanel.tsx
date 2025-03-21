import React, { useMemo } from 'react';
import { Tag, CheckCircle2, X, ChevronUp, ChevronDown, Circle } from 'lucide-react';
import Tooltip from '../common/Tooltip';
import { FilterOptions, ProductTag } from '../../types';
import { FilterInfo, FilterType } from '../../hooks/useFilterSystem';
import ActiveFilters from './ActiveFilters';

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
  // ActiveFilters関連
  activeFilters?: FilterInfo[];
  removeFilter?: (type: FilterType, id: string) => void;
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
  filteredResultsCount,
  activeFilters = [],
  removeFilter
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

  // フィルターが適用されているかをチェック
  const hasFilters = useMemo(() => {
    return (
      selectedTags.size > 0 || 
      filterOptions.filterKeywords.length > 0 || 
      filterOptions.excludeKeywords.length > 0 || 
      filterOptions.excludeMultipleBids || 
      filterOptions.excludeJunk || 
      filterOptions.excludeNew || 
      filterOptions.excludeSets ||
      filterOptions.excludeFreeShipping
    );
  }, [
    selectedTags, 
    filterOptions.filterKeywords, 
    filterOptions.excludeKeywords,
    filterOptions.excludeMultipleBids,
    filterOptions.excludeJunk,
    filterOptions.excludeNew,
    filterOptions.excludeSets,
    filterOptions.excludeFreeShipping
  ]);

  // タグをグループごとに整理
  const organizedTags = useMemo(() => {
    if (!availableTags.length) return {};
    
    return availableTags.reduce((acc, { tag, count }) => {
      if (!acc[tag.group]) {
        acc[tag.group] = [];
      }
      acc[tag.group].push({ tag, count });
      return acc;
    }, {} as Record<string, typeof availableTags>);
  }, [availableTags]);

  // タグボタンのレンダリング関数
  const renderTagButton = ({ tag, count }: { tag: ProductTag; count: number }) => {
    return (
      <Tooltip key={tag.keyword} text={`${count}件の商品がこのタグを持っています`}>
        <div
          onClick={() => toggleTagFilter(tag.keyword)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer ${
            selectedTags.has(tag.keyword)
              ? `${tag.color} shadow-sm`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{tag.label}</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${
            selectedTags.has(tag.keyword) 
              ? 'bg-white/80 text-gray-700' 
              : 'bg-white text-gray-500'
          }`}>
            {count}
          </span>
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      {/* アクティブフィルター表示（存在する場合） */}
      {activeFilters.length > 0 && removeFilter && (
        <ActiveFilters 
          filters={activeFilters} 
          onRemoveFilter={removeFilter} 
          onClearAll={resetAllFilters} 
        />
      )}

      {/* フィルターパネルのヘッダー - divを使用 */}
      <div
        onClick={() => setIsTagsVisible(!isTagsVisible)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2 cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <Tag size={16} />
          絞り込み
          <span className={`px-1.5 py-0.5 rounded-full text-xs ${
            hasFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {resultsCount.toLocaleString()}件
            {hasFilters && (
              <>
                <span className="mx-0.5">→</span>
                {filteredResultsCount.toLocaleString()}件
              </>
            )}
          </span>
        </div>
        {/* フィルタークリアボタン */}
        <div className="flex items-center gap-1.5">
          {hasFilters && (
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
      </div>

      {/* フィルターコンテンツ */}
      {isTagsVisible && (
        <div className="space-y-4">
          {/* 含む系フィルター */}
          <div className="space-y-2">
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
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newFilterKeyword.trim()) {
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

            {/* タグ絞り込み - divを使用 */}
            <div className="flex justify-end">
              <div
                onClick={() => setShowTags(!showTags)}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                タグで絞り込む
                {showTags ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </div>
            </div>
            {showTags && Object.keys(organizedTags).length > 0 && (
              <div className="space-y-2 mt-2">
                {(['状態', 'ジャンク', 'まとめ', '送料'] as const).map(group => {
                  const groupTags = organizedTags[group];
                  if (!groupTags || groupTags.length === 0) return null;
                  
                  return (
                    <div key={group} className="space-y-1">
                      <div className="text-xs text-gray-500">{group}</div>
                      <div className="flex flex-wrap gap-1">
                        {groupTags.map(item => renderTagButton(item))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 除外系フィルター */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
              <div className="text-xs font-bold text-gray-600">除外</div>
            </div>

            {/* 除外キーワード入力 */}
            <div className="space-y-2">
              <div className="relative">
                <X size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={newExcludeKeyword}
                  onChange={(e) => setNewExcludeKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing && newExcludeKeyword.trim()) {
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

            <div className="flex flex-wrap gap-1 mt-2">
              <Tooltip text="「入札1」を除外">
                <div
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeMultipleBids: !prev.excludeMultipleBids }))}
                  className={`px-2 py-1 border rounded text-xs transition-colors duration-200 cursor-pointer ${
                    filterOptions.excludeMultipleBids
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  入札1
                </div>
              </Tooltip>
              <Tooltip text="「ジャンク」「現状品」を除外">
                <div
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeJunk: !prev.excludeJunk }))}
                  className={`px-2 py-1 border rounded text-xs transition-colors duration-200 cursor-pointer ${
                    filterOptions.excludeJunk
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  ジャンク品
                </div>
              </Tooltip>
              <Tooltip text="「まとめ」「セット」を除外">
                <div
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeSets: !prev.excludeSets }))}
                  className={`px-2 py-1 border rounded text-xs transition-colors duration-200 cursor-pointer ${
                    filterOptions.excludeSets
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  セット商品
                </div>
              </Tooltip>
              <Tooltip text="「新品」「未使用」「未開封」を除外">
                <div
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeNew: !prev.excludeNew }))}
                  className={`px-2 py-1 border rounded text-xs transition-colors duration-200 cursor-pointer ${
                    filterOptions.excludeNew
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  新品
                </div>
              </Tooltip>
              <Tooltip text="「送料無料」「送料込」を除外">
                <div
                  onClick={() => setFilterOptions(prev => ({ ...prev, excludeFreeShipping: !prev.excludeFreeShipping }))}
                  className={`px-2 py-1 border rounded text-xs transition-colors duration-200 cursor-pointer ${
                    filterOptions.excludeFreeShipping
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  送料無料
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 