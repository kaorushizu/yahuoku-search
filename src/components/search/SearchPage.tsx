import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import SearchForm from './SearchForm';
import AdvancedSearchPanel from './AdvancedSearchPanel';
import { useSearch } from '../../contexts/SearchContext';

/**
 * 初期画面の検索ページコンポーネント
 * 検索フォームと詳細検索パネルを含む
 */
const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  
  // コンテキストからデータを取得
  const {
    searchParams,
    setSearchParams,
    searchHistory,
    isLoading,
    isCompanyOnly,
    setIsCompanyOnly,
    handleSearch: originalHandleSearch,
  } = useSearch();
  
  // 検索実行時に URL を更新する処理をラップ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 検索キーワードが存在する場合、search ページに遷移
    if (searchParams.keyword) {
      // 現在のURLパラメータを取得
      const currentParams = new URLSearchParams(location.search);
      const currentKeyword = currentParams.get('keyword');
      
      // 同じキーワードでURLが既に設定されていれば、検索を実行しない
      if (currentKeyword === searchParams.keyword && location.pathname === '/search') {
        return;
      }
      
      // 検索実行
      originalHandleSearch(e);
      
      // 検索結果ページに遷移
      navigate(`/search?keyword=${encodeURIComponent(searchParams.keyword)}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">ヤフオク相場検索</h1>
      <p className="text-gray-600 text-lg mb-8">過去の落札商品から価格相場をリサーチ</p>
      <div className="w-full max-w-2xl px-4">
        <SearchForm 
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          searchHistory={searchHistory}
          onSearch={handleSubmit}
          isLoading={isLoading}
        />
        {/* 詳細検索ボタン */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm ${
              isAdvancedSearch || Object.values(searchParams).some(value => value && typeof value === 'string' && value.length > 0 && value !== searchParams.keyword)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal size={16} />
            詳細検索
          </button>
        </div>
        {/* 詳細検索パネル */}
        {isAdvancedSearch && (
          <AdvancedSearchPanel
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            isCompanyOnly={isCompanyOnly}
            setIsCompanyOnly={setIsCompanyOnly}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage; 