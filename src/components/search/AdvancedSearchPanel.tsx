import React from 'react';
import { X } from 'lucide-react';
import { SearchParams } from '../../types';

interface AdvancedSearchPanelProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  isCompanyOnly: boolean;
  setIsCompanyOnly: React.Dispatch<React.SetStateAction<boolean>>;
  isDarkMode?: boolean;
}

/**
 * 詳細検索パネルコンポーネント
 * 詳細検索オプションを提供（除外キーワード、商品状態、出品者ID、価格範囲など）
 */
const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  searchParams,
  setSearchParams,
  isCompanyOnly,
  setIsCompanyOnly,
  isDarkMode = false
}) => {
  // 詳細検索条件をクリアする
  const clearSearchOptions = () => {
    setSearchParams({
      keyword: '',
      page: 1,
      excludeKeywords: [],
      status: '',
      sellerId: '',
      minPrice: '',
      maxPrice: ''
    });
    setIsCompanyOnly(false);
  };

  // 背景色、テキスト色のクラスをダークモードに応じて設定
  const bgClass = isDarkMode ? 'bg-gray-800/60' : 'bg-white';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-700';
  const labelClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const clearBtnBgClass = isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200';
  const clearBtnTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const placeholderClass = isDarkMode ? 'placeholder-gray-400' : 'placeholder-gray-500';

  return (
    <div className={`${isDarkMode ? 'py-3 border-t border-gray-800' : 'mt-6 bg-white rounded-xl shadow-lg p-6'}`}>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-4 md:space-y-0 md:flex md:gap-4 w-full">
          {/* 除外キーワード入力 */}
          <div className="flex-1">
            <label className={`block text-xs font-medium ${labelClass} mb-1`}>
              除外キーワード
            </label>
            <input
              type="text"
              value={searchParams.excludeKeywords.join(',')}
              onChange={(e) => setSearchParams(prev => ({ ...prev, excludeKeywords: e.target.value ? e.target.value.split(',') : [] }))}
              placeholder="除外するキーワード"
              className={`w-full px-3 py-2 md:py-1.5 ${bgClass} border ${borderClass} rounded text-sm ${textClass} ${placeholderClass}`}
            />
          </div>
          {/* 商品状態選択 */}
          <div className="flex-1">
            <label className={`block text-xs font-medium ${labelClass} mb-1`}>
              商品の状態（一部対応）
            </label>
            <select
              value={searchParams.status}
              onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
              className={`w-full px-3 py-2 md:py-1.5 ${bgClass} border ${borderClass} rounded text-sm ${textClass}`}
            >
              <option value="">すべて</option>
              <option value="new">新品</option>
              <option value="used">中古</option>
            </select>
          </div>
          {/* 出品者ID入力 */}
          <div className="flex-1">
            <label className={`block text-xs font-medium ${labelClass} mb-1`}>
              出品者ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchParams.sellerId}
                onChange={(e) => setSearchParams(prev => ({ ...prev, sellerId: e.target.value }))}
                placeholder="出品者のID"
                className={`w-full px-3 py-2 md:py-1.5 ${bgClass} border ${borderClass} rounded text-sm ${textClass} ${placeholderClass}`}
                disabled={isCompanyOnly}
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                <input
                  type="checkbox"
                  id="companyOnly"
                  checked={isCompanyOnly}
                  onChange={(e) => {
                    setIsCompanyOnly(e.target.checked);
                    if (e.target.checked) {
                      setSearchParams(prev => ({ ...prev, sellerId: 'myniw58319' }));
                    } else {
                      setSearchParams(prev => ({ ...prev, sellerId: '' }));
                    }
                  }}
                  className={`h-3 w-3 text-gray-600 ${bgClass} ${borderClass} rounded`}
                />
                <label htmlFor="companyOnly" className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  自社
                </label>
              </div>
            </div>
          </div>
          {/* 価格範囲入力 */}
          <div className="flex-1">
            <label className={`block text-xs font-medium ${labelClass} mb-1`}>
              価格範囲
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={searchParams.minPrice}
                onChange={(e) => setSearchParams(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="¥1000"
                className={`w-full px-3 py-2 md:py-1.5 ${bgClass} border ${borderClass} rounded text-sm ${textClass} ${placeholderClass}`}
              />
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>~</span>
              <input
                type="number"
                value={searchParams.maxPrice}
                onChange={(e) => setSearchParams(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="¥5000"
                className={`w-full px-3 py-2 md:py-1.5 ${bgClass} border ${borderClass} rounded text-sm ${textClass} ${placeholderClass}`}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 詳細検索条件クリアボタン */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={clearSearchOptions}
          className={`px-3 py-1.5 ${clearBtnBgClass} ${clearBtnTextClass} rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1`}
        >
          <X size={14} />
          詳細条件をクリア
        </button>
      </div>
    </div>
  );
};

export default AdvancedSearchPanel; 