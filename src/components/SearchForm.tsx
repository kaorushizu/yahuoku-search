import React, { useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { SearchParams } from '../types';

interface SearchFormProps {
  searchParams: SearchParams;
  onSearchParamsChange: (params: Partial<SearchParams>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAdvancedSearch: boolean;
  onToggleAdvancedSearch: () => void;
  searchHistory: string[];
  isHistoryVisible: boolean;
  onHistoryItemClick: (keyword: string) => void;
  isCompanyOnly: boolean;
  onCompanyOnlyChange: (value: boolean) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  onSearchParamsChange,
  onSubmit,
  isAdvancedSearch,
  onToggleAdvancedSearch,
  searchHistory,
  isHistoryVisible,
  onHistoryItemClick,
  isCompanyOnly,
  onCompanyOnlyChange
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="flex flex-col space-y-2">
        <div className="flex">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="検索キーワードを入力"
              value={searchParams.keyword}
              onChange={(e) => onSearchParamsChange({ keyword: e.target.value })}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            {isHistoryVisible && searchHistory.length > 0 && (
              <div className="absolute z-20 w-full top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                    onClick={() => onHistoryItemClick(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={onToggleAdvancedSearch}
            className={`p-2.5 ${isAdvancedSearch ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} hover:brightness-95 active:brightness-90`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            検索
          </button>
        </div>
        
        {isAdvancedSearch && (
          <div className="grid gap-2 p-4 bg-white rounded-md shadow-md animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <label htmlFor="negative_keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  除外キーワード
                </label>
                <input
                  type="text"
                  id="negative_keyword"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: ジャンク,壊れ"
                  value={searchParams.negative_keyword}
                  onChange={(e) => onSearchParamsChange({ negative_keyword: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  商品の状態
                </label>
                <select
                  id="status"
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchParams.status}
                  onChange={(e) => onSearchParamsChange({ status: e.target.value })}
                >
                  <option value="">すべて</option>
                  <option value="new">新品</option>
                  <option value="used">中古</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="seller" className="block text-sm font-medium text-gray-700 mb-1">
                  出品者ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="seller"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例: user123"
                    value={isCompanyOnly ? 'myniw58319' : searchParams.seller}
                    onChange={(e) => {
                      if (!isCompanyOnly) {
                        onSearchParamsChange({ seller: e.target.value });
                      }
                    }}
                    disabled={isCompanyOnly}
                  />
                </div>
                <div className="mt-1 flex items-center">
                  <input
                    type="checkbox"
                    id="company_only"
                    className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                    checked={isCompanyOnly}
                    onChange={(e) => onCompanyOnlyChange(e.target.checked)}
                  />
                  <label htmlFor="company_only" className="text-xs text-gray-600">
                    販売元のみ (myniw58319)
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="min_price" className="block text-sm font-medium text-gray-700 mb-1">
                    最低価格
                  </label>
                  <input
                    type="text"
                    id="min_price"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="¥"
                    value={searchParams.min}
                    onChange={(e) => onSearchParamsChange({ min: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
                    最高価格
                  </label>
                  <input
                    type="text"
                    id="max_price"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="¥"
                    value={searchParams.max}
                    onChange={(e) => onSearchParamsChange({ max: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm; 