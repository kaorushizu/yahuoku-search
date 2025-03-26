import React, { useState, useEffect } from 'react';
import { useFilter } from '../../contexts/FilterContext';
import FilterPanel from './FilterPanel';
import StatisticsPanel from '../statistics/StatisticsPanel';
import { Statistics, ProductTag, FilterOptions } from '../../types';
import { ShoppingBag, ShoppingCart, Store, ExternalLink } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';

// PriceRangeの型定義
interface PriceRange {
  min: number;
  max: number;
  range: string;
}

interface FilterWrapperProps {
  statistics: Statistics;
  currentStatistics?: Statistics;
  showTags: boolean;
  setShowTags: React.Dispatch<React.SetStateAction<boolean>>;
  resetAllFilters: () => void;
  onApplyPriceRange: (min: number, max: number) => void;
  onClearPriceRange: () => void;
  hasPriceRangeFilter: boolean;
  totalResultsCount: number;
  filteredResultsCount: number;
}

/**
 * フィルター関連のコンポーネントをまとめるラッパーコンポーネント
 * FilterContextからデータを取得し、フィルター関連のUIを提供
 */
const FilterWrapper: React.FC<FilterWrapperProps> = ({
  statistics,
  currentStatistics,
  showTags,
  setShowTags,
  resetAllFilters,
  onApplyPriceRange,
  onClearPriceRange,
  hasPriceRangeFilter,
  totalResultsCount,
  filteredResultsCount
}) => {
  const {
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
    toggleTagFilter,
    availableTags,
    addFilterKeyword,
    addExcludeKeyword,
    priceRanges,
    togglePriceRangeFilter,
    clearPriceRangeFilters
  } = useFilter();

  const { searchParams } = useSearch();
  const keyword = searchParams.keyword || '';
  
  // タグ表示状態 - 初期状態は開いている
  const [isTagsVisible, setIsTagsVisible] = useState(true);
  
  // 統計情報表示状態 - 初期状態は開いている
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  
  // 外部サイト検索リンク表示状態 - 初期状態は開いている
  const [isExternalLinksVisible, setIsExternalLinksVisible] = useState(true);
  
  // 元の統計情報を保持
  const [originalStatistics, setOriginalStatistics] = useState<Statistics>(statistics);

  // 統計情報が変更されたときに、元の統計情報を更新（フィルターが空の時のみ）
  useEffect(() => {
    if (priceRanges.length === 0) {
      setOriginalStatistics(statistics);
    }
  }, [statistics, priceRanges.length]);

  // hasPriceRangeFilterに基づいてselectedPriceRangesを更新
  useEffect(() => {
    if (!hasPriceRangeFilter && priceRanges.length > 0) {
      clearPriceRangeFilters();
    }
  }, [hasPriceRangeFilter, priceRanges.length, clearPriceRangeFilters]);

  // フィルターキーワード追加ヘルパー
  const handleAddFilterKeyword = () => {
    if (newFilterKeyword.trim()) {
      addFilterKeyword(newFilterKeyword.trim());
    }
  };

  // 除外キーワード追加ヘルパー
  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword.trim()) {
      addExcludeKeyword(newExcludeKeyword.trim());
    }
  };

  // 価格範囲クリック時の処理
  const handlePriceRangeClick = (rangeStart: number, rangeEnd: number, rangeText: string) => {
    console.log(`FilterWrapper: Price range clicked ${rangeStart}-${rangeEnd} (${rangeText})`);
    
    // FilterContextのtogglePriceRangeFilterを使用
    togglePriceRangeFilter(rangeStart, rangeEnd, rangeText);
    
    // 親コンポーネントにも通知
    onApplyPriceRange(rangeStart, rangeEnd);
  };

  // 価格範囲クリア
  const handleClearAllPriceRanges = () => {
    console.log('FilterWrapper: Clearing all price ranges');
    
    // FilterContextのクリア関数を呼び出す
    clearPriceRangeFilters();
    
    // 親コンポーネントにも通知
    onClearPriceRange();
  };

  // 外部サイトへのリンクを生成する関数
  const generateExternalSearchUrl = (site: 'mercari' | 'amazon' | 'surugaya') => {
    const encodedKeyword = encodeURIComponent(keyword);
    
    switch (site) {
      case 'mercari':
        return `https://jp.mercari.com/search?keyword=${encodedKeyword}&page=1`;
      case 'amazon':
        return `https://www.amazon.co.jp/s?k=${encodedKeyword}`;
      case 'surugaya':
        return `https://www.suruga-ya.jp/kaitori/search_buy?category=&search_word=${encodedKeyword}&searchbox=1`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* フィルターパネル */}
      <FilterPanel
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        filterKeyword={filterKeyword}
        setFilterKeyword={setFilterKeyword}
        newFilterKeyword={newFilterKeyword}
        setNewFilterKeyword={setNewFilterKeyword}
        newExcludeKeyword={newExcludeKeyword}
        setNewExcludeKeyword={setNewExcludeKeyword}
        toggleTagFilter={toggleTagFilter}
        resetAllFilters={resetAllFilters}
        availableTags={availableTags}
        addFilterKeyword={handleAddFilterKeyword}
        addExcludeKeyword={handleAddExcludeKeyword}
        showTags={showTags}
        setShowTags={setShowTags}
        isTagsVisible={isTagsVisible}
        setIsTagsVisible={setIsTagsVisible}
        resultsCount={totalResultsCount}
        filteredResultsCount={filteredResultsCount}
      />
      
      {/* 他のサイトでの検索リンク */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
             onClick={() => setIsExternalLinksVisible(!isExternalLinksVisible)}>
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <ExternalLink size={16} className="text-gray-500" />
            他のサイトで検索
          </h3>
          <button 
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={isExternalLinksVisible ? "折りたたむ" : "展開する"}
          >
            {isExternalLinksVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </button>
        </div>
        
        {isExternalLinksVisible && (
          <div className="p-3 space-y-2">
            {/* キーワードが空の場合のメッセージ */}
            {!keyword && (
              <p className="text-xs text-gray-500 mb-2">検索キーワードを入力すると、他のサイトでも検索できます</p>
            )}
            
            {/* メルカリで検索 */}
            <a 
              href={generateExternalSearchUrl('mercari')}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-sm ${
                !keyword ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={(e) => !keyword && e.preventDefault()}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-red-500" />
                <span>メルカリで検索</span>
              </div>
              {keyword && <ExternalLink size={14} className="text-gray-400" />}
            </a>
            
            {/* Amazonで検索 */}
            <a 
              href={generateExternalSearchUrl('amazon')}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-sm ${
                !keyword ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={(e) => !keyword && e.preventDefault()}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-amber-500" />
                <span>Amazonで検索</span>
              </div>
              {keyword && <ExternalLink size={14} className="text-gray-400" />}
            </a>
            
            {/* 駿河屋で検索 */}
            <a 
              href={generateExternalSearchUrl('surugaya')}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded text-sm ${
                !keyword ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={(e) => !keyword && e.preventDefault()}
            >
              <div className="flex items-center gap-2">
                <Store size={16} className="text-blue-500" />
                <span>駿河屋で検索</span>
              </div>
              {keyword && <ExternalLink size={14} className="text-gray-400" />}
            </a>
          </div>
        )}
      </div>

      {/* 統計情報パネル (サイドバー) - 常に元の統計情報を表示 */}
      {totalResultsCount > 0 && originalStatistics && (
        <StatisticsPanel
          statistics={originalStatistics}
          isCompact={true}
          isVisible={isStatsVisible}
          onToggleVisibility={() => setIsStatsVisible(!isStatsVisible)}
          onPriceRangeClick={handlePriceRangeClick}
          selectedPriceRanges={priceRanges.map(p => ({ min: p.min, max: p.max, range: p.label }))}
          hasActiveFilters={priceRanges.length > 0 || selectedTags.size > 0 || filterOptions.filterKeywords.length > 0}
          hasActivePriceFilters={priceRanges.length > 0}
          onClearAllPriceRanges={handleClearAllPriceRanges}
        />
      )}
      
      {/* 価格範囲フィルター情報パネル */}
      {priceRanges.length > 0 && (
        <div className="price-range-filters mt-4">
          <PriceRangeFiltersWrapper
            selectedPriceRanges={priceRanges.map(p => ({ min: p.min, max: p.max, range: p.label }))}
            clearAllPriceRangeFilters={handleClearAllPriceRanges}
            filteredResultsCount={filteredResultsCount}
            totalResultsCount={totalResultsCount}
          />
        </div>
      )}
    </div>
  );
};

/**
 * PriceRangeFiltersのラッパーコンポーネント
 */
interface PriceRangeFiltersWrapperProps {
  selectedPriceRanges: PriceRange[];
  clearAllPriceRangeFilters: () => void;
  filteredResultsCount: number;
  totalResultsCount: number;
}

const PriceRangeFiltersWrapper: React.FC<PriceRangeFiltersWrapperProps> = (props) => {
  // 重複を除去した価格範囲を生成
  const uniqueRanges = props.selectedPriceRanges.reduce((acc, current) => {
    const isDuplicate = acc.some(item => item.min === current.min && item.max === current.max);
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, [] as PriceRange[]);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium text-blue-700">価格範囲フィルター</div>
        <button 
          onClick={props.clearAllPriceRangeFilters}
          className="text-sm text-red-500 hover:text-red-700"
        >
          クリア
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueRanges.map((range, index) => (
          <div 
            key={index} 
            className="bg-white border border-blue-300 rounded-md px-2 py-1 text-sm text-blue-700 flex items-center"
          >
            <span>{range.range}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-blue-600 mt-2">
        {props.filteredResultsCount} / {props.totalResultsCount} 件表示
      </div>
    </div>
  );
};

export default FilterWrapper; 