import React, { useRef, useState } from 'react';
import { Search, X, History } from 'lucide-react';
import { SearchParams } from '../../types';

interface SearchFormProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  searchHistory: string[];
  onSearch: (e: React.FormEvent) => void;
  isLoading?: boolean;
  isHeader?: boolean;
}

/**
 * 検索フォームコンポーネント
 * メインの検索ボックスと検索履歴表示を担当
 */
const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  searchHistory,
  onSearch,
  isLoading = false,
  isHeader = false
}) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // 検索ボックス外のクリックを監視
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 検索ボックスやコンテナ外のクリックの場合、検索履歴を非表示にする
      if (
        isHistoryVisible &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        historyRef.current &&
        !historyRef.current.contains(event.target as Node)
      ) {
        setIsHistoryVisible(false);
      }
    };

    // イベントリスナーを追加
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // クリーンアップ
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHistoryVisible]);

  // ヘッダーバージョンと通常バージョンで異なるスタイルを適用
  if (isHeader) {
    return (
      <div className="relative flex-1" ref={searchContainerRef}>
        <form onSubmit={onSearch} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
              onFocus={(e) => {
                setIsHistoryVisible(true);
                // フォーカス時にテキストを全選択
                e.target.select();
              }}
              onKeyDown={(e) => {
                // 日本語入力確定中のEnterキーを無視
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (searchInputRef.current) {
                    searchInputRef.current.blur();
                  }
                  setIsHistoryVisible(false);
                  onSearch(e);
                }
              }}
              placeholder="すべてのアイテムから探す"
              className="w-full pl-9 pr-10 py-2 h-10 bg-gray-700/50 border border-gray-700 rounded text-base text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              autoComplete="off"
            />
            {/* 検索クリアボタン */}
            {searchParams.keyword && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchParams({
                    keyword: '',
                    page: 1,
                    excludeKeywords: [],
                    status: '',
                    sellerId: '',
                    minPrice: '',
                    maxPrice: ''
                  });
                  if (searchInputRef.current) {
                    searchInputRef.current.blur();
                  }
                  setIsHistoryVisible(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {/* 検索実行ボタン */}
          <button
            type="submit"
            className="shrink-0 px-4 py-2 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            disabled={isLoading}
          >
            <Search size={16} />
            <span className="hidden md:inline">検索</span>
          </button>
        </form>
        
        {/* 検索履歴の表示 */}
        {isHistoryVisible && searchHistory.length > 0 && (
          <div 
            ref={historyRef}
            className="absolute z-50 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
          >
            {searchHistory.map((term, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSearchParams(prev => ({ ...prev, keyword: term }));
                  setIsHistoryVisible(false);
                  if (searchInputRef.current) {
                    searchInputRef.current.blur();
                  }
                }}
                className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <History size={16} className="text-gray-400" />
                {term}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 通常の検索フォーム（初期表示用）
  return (
    <form onSubmit={onSearch} className="relative">
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={searchParams.keyword}
          onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
          onFocus={(e) => {
            setIsHistoryVisible(true);
            // フォーカス時にテキストを全選択
            e.target.select();
          }}
          onKeyDown={(e) => {
            // 日本語入力確定中のEnterキーを無視
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (searchInputRef.current) {
                searchInputRef.current.blur();
              }
              setIsHistoryVisible(false);
              onSearch(e);
            }
          }}
          placeholder="すべてのアイテムから探す"
          className="w-full px-6 py-4 pr-16 text-lg border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md transition-shadow duration-200 bg-white"
          autoComplete="off"
        />
        {/* 検索フォームのアクションボタン */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
          {searchParams.keyword && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setSearchParams(prev => ({ ...prev, keyword: '' }));
                if (searchInputRef.current) {
                  searchInputRef.current.blur();
                }
                setIsHistoryVisible(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          )}
          <button
            type="submit"
            className="text-gray-400 hover:text-gray-600 p-1"
            disabled={isLoading}
          >
            <Search size={20} />
          </button>
        </div>
      </div>
      {/* 検索履歴の表示 */}
      {isHistoryVisible && searchHistory.length > 0 && (
        <div 
          ref={historyRef}
          className="absolute z-50 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
        >
          {searchHistory.map((term, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSearchParams(prev => ({ ...prev, keyword: term }));
                setIsHistoryVisible(false);
                if (searchInputRef.current) {
                  searchInputRef.current.blur();
                }
              }}
              className="w-full text-left px-6 py-3 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <History size={16} className="text-gray-400" />
              {term}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchForm; 