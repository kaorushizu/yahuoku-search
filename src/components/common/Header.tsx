import React from 'react';
import { SlidersHorizontal, LayoutGrid, Table, HelpCircle } from 'lucide-react';
import SearchForm from '../search/SearchForm';
import AdvancedSearchPanel from '../search/AdvancedSearchPanel';
import { SearchParams } from '../../types';

interface HeaderProps {
  // 検索関連
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  currentSearchKeyword: string;
  searchHistory: string[];
  isLoading: boolean;
  isCompanyOnly: boolean;
  setIsCompanyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  handleSearch: (e: React.FormEvent, newPage?: number, resetFilters?: () => void, clearSelected?: () => void, resetSort?: () => void) => void;
  
  // 詳細検索パネル
  isAdvancedSearch: boolean;
  setIsAdvancedSearch: React.Dispatch<React.SetStateAction<boolean>>;
  
  // ヘルプ表示
  setShowHelp: React.Dispatch<React.SetStateAction<boolean>>;
  
  // レイアウト切り替え
  layout: 'grid' | 'table';
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  
  // 結果表示関連
  resultsCount: number;
  filteredResultsCount: number;
  hasResults: boolean;
}

/**
 * アプリケーションのヘッダーコンポーネント
 * 検索フォーム、詳細検索パネル、レイアウト切り替えなどのコントロールを含む
 */
const Header: React.FC<HeaderProps> = ({
  searchParams,
  setSearchParams,
  currentSearchKeyword,
  searchHistory,
  isLoading,
  isCompanyOnly,
  setIsCompanyOnly,
  handleSearch,
  isAdvancedSearch,
  setIsAdvancedSearch,
  setShowHelp,
  layout,
  setLayout,
  resultsCount,
  filteredResultsCount,
  hasResults
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-8xl mx-auto px-4">
        <div className="flex items-center h-14">
          <h1 className="hidden md:block text-lg font-bold text-white mr-8 whitespace-nowrap">ヤフオク相場検索</h1>
          {/* 検索バー */}
          <div className="flex items-center flex-1 max-w-3xl gap-2">
            <SearchForm 
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              searchHistory={searchHistory}
              onSearch={handleSearch}
              isLoading={isLoading}
              isHeader={true}
            />
            {/* 詳細検索ボタン */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs relative ${
                  isAdvancedSearch || Object.values(searchParams).some(value => value && typeof value === 'string' && value.length > 0 && value !== searchParams.keyword)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>詳細検索</span>
                {/* アクティブな検索条件の表示 */}
                {!isAdvancedSearch && Object.entries(searchParams).some(([key, value]) => {
                  if (key === 'keyword' || key === 'page') return false;
                  return value && value.length > 0;
                }) && (
                  <div className="flex items-center gap-1 ml-1 pl-1 border-l border-current border-opacity-20">
                    {searchParams.excludeKeywords.length > 0 && (
                      <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">除外</span>
                    )}
                    {searchParams.status && (
                      <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">
                        {searchParams.status === 'new' ? '新品' : '中古'}
                      </span>
                    )}
                    {searchParams.sellerId && (
                      <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">出品者</span>
                    )}
                    {(searchParams.minPrice || searchParams.maxPrice) && (
                      <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">価格</span>
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* 右側の要素をまとめて右寄せ */}
          <div className="flex items-center gap-4 ml-auto">
            {/* 検索結果件数表示 */}
            {hasResults && (
              <div className="hidden md:block">
                <div className="text-sm text-gray-300">
                  <span className="font-bold text-lg text-white">{resultsCount.toLocaleString()}</span>
                  <span className="mx-1">件中</span>
                  <span className="font-bold text-lg text-white">{filteredResultsCount.toLocaleString()}</span>
                  <span className="mx-1">件表示</span>
                </div>
              </div>
            )}
          
            {/* レイアウト切り替えボタン */}
            {hasResults && (
              <div className="hidden md:flex items-center border border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setLayout('grid')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    layout === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  title="グリッド表示"
                >
                  <LayoutGrid size={14} />
                  <span>グリッド</span>
                </button>
                <button
                  onClick={() => setLayout('table')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    layout === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  title="テーブル表示"
                >
                  <Table size={14} />
                  <span>テーブル</span>
                </button>
              </div>
            )}
          
            {/* モバイル用詳細検索ボタンとヘルプボタン */}
            <div className="flex items-center">
              <button
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors duration-200"
                title="詳細検索"
              >
                <SlidersHorizontal size={20} className="text-gray-400 hover:text-gray-300" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="hidden md:block p-2 rounded hover:bg-gray-800 transition-colors duration-200"
                title="ヘルプを表示"
              >
                <HelpCircle size={20} className="text-gray-400 hover:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 詳細検索パネル */}
        {isAdvancedSearch && (
          <AdvancedSearchPanel
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            isCompanyOnly={isCompanyOnly}
            setIsCompanyOnly={setIsCompanyOnly}
            isDarkMode={true}
          />
        )}
      </div>
    </header>
  );
};

export default Header; 