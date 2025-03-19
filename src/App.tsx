import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, History, Package2, CircleDollarSign, ChevronLeft, ChevronRight, ExternalLink, ArrowUpDown, Calculator, ArrowUp, ArrowDown, ChevronDown, ChevronUp, X, ArrowUpToLine, CheckCircle2, Trash2, Tag, Calendar, JapaneseYen, HelpCircle, SlidersHorizontal, Circle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import HelpPage from './components/HelpPage';

interface AuctionItem {
  オークションID: string;
  商品名: string;
  落札金額: number;
  画像URL: string;
  入札数: number;
  終了日: string;
}

interface ApiResponse {
  page: number;
  page_total: number;
  items: AuctionItem[];
  total_count?: number;
}

interface SearchParams {
  keyword: string;
  page: number;
  negative_keyword: string;
  status: string;
  seller: string;
  min: string;
  max: string;
}

interface FilterOptions {
  selectedTags: string[];
  excludeMultipleBids: boolean;
  excludeJunk: boolean;
  excludeKeywords: string[];
  excludeSets: boolean;
  excludeNew: boolean;
  filterKeywords: string[];
}

interface Statistics {
  median: number;
  average: number;
  max: number;
  min: number;
  priceRanges: { range: string; count: number }[];
}

interface ProductTag {
  keyword: string;
  label: string;
  color: string;
  group: '状態' | 'ジャンク' | 'まとめ' | '送料';
}

interface TagCount {
  tag: ProductTag;
  count: number;
}

type SortOrder = 'none' | 'asc' | 'desc';

const PRODUCT_TAGS: ProductTag[] = [
  // 状態関連
  { keyword: '新品', label: '新品', color: 'bg-green-600/90 text-white', group: '状態' },
  { keyword: '未開封', label: '未開封', color: 'bg-teal-600/90 text-white', group: '状態' },
  { keyword: '未使用', label: '未使用', color: 'bg-emerald-600/90 text-white', group: '状態' },
  { keyword: '美品', label: '美品', color: 'bg-blue-600/90 text-white', group: '状態' },

  // ジャンク関連
  { keyword: 'ジャンク', label: 'ジャンク', color: 'bg-red-600/90 text-white', group: 'ジャンク' },
  { keyword: '現状', label: '現状品', color: 'bg-orange-600/90 text-white', group: 'ジャンク' },
  { keyword: '訳あり', label: '訳あり', color: 'bg-amber-600/90 text-white', group: 'ジャンク' },

  // まとめ関連
  { keyword: 'まとめ', label: 'まとめ', color: 'bg-indigo-600/90 text-white', group: 'まとめ' },
  { keyword: 'セット', label: 'セット', color: 'bg-violet-600/90 text-white', group: 'まとめ' },

  // 送料関連
  { keyword: '送料無料', label: '送料無料', color: 'bg-purple-600/90 text-white', group: '送料' },
  { keyword: '送料込', label: '送料込み', color: 'bg-fuchsia-600/90 text-white', group: '送料' },
];

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

function App() {
  const getAuctionUrl = (auctionId: string) => {
    return `https://page.auctions.yahoo.co.jp/jp/auction/${auctionId}`;
  };

  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    page: 1,
    negative_keyword: '',
    status: '',
    seller: '',
    min: '',
    max: '',
  });
  const [filterKeyword, setFilterKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [results, setResults] = useState<AuctionItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [isCompanyOnly, setIsCompanyOnly] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedTags: [],
    excludeMultipleBids: false,
    excludeJunk: false,
    excludeKeywords: [],
    excludeSets: false,
    excludeNew: false,
    filterKeywords: []
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isTagsVisible, setIsTagsVisible] = useState(true);
  const [isStatsVisible, setIsStatsVisible] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const mainStatsRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [newFilterKeyword, setNewFilterKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [showTags, setShowTags] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'table'>('grid');

  const buildSearchUrl = (params: SearchParams) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.append(key, value.toString());
      }
    });
    return `https://revathis-api.vercel.app/api/aucfree?${urlParams.toString()}`;
  };

  const resetAllFilters = () => {
    setSelectedTags(new Set());
    setFilterKeyword('');
    setNewFilterKeyword('');
    setNewExcludeKeyword('');
    setFilterOptions({
      selectedTags: [],
      excludeMultipleBids: false,
      excludeJunk: false,
      excludeKeywords: [],
      excludeSets: false,
      excludeNew: false,
      filterKeywords: []
    });
  };

  const handleSearch = async (e: React.FormEvent, newPage?: number) => {
    e?.preventDefault();
    if (!searchParams.keyword.trim()) return;

    // Close keyboard on mobile
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    // 詳細検索パネルを閉じる
    setIsAdvancedSearch(false);

    const isNewSearch = !newPage;
    
    setIsLoading(true);
    setError(null);

    // 新しい検索時に全ての絞り込みをリセット
    if (isNewSearch) {
      resetAllFilters();
      setResults([]);
      setCurrentSearchKeyword(searchParams.keyword);
      setSelectedItems(new Set());
      setShowSelectedOnly(false);
    }

    const updatedParams = {
      ...searchParams,
      page: isNewSearch ? 1 : (newPage || 1),
      seller: isCompanyOnly ? 'myniw58319' : searchParams.seller,
    };
    setSearchParams(updatedParams);

    try {
      const response = await fetch(buildSearchUrl(updatedParams));
      if (!response.ok) throw new Error('検索中にエラーが発生しました');
      
      const data: ApiResponse = await response.json();
      
      if (isNewSearch) {
        setResults(data.items);
      } else {
        setResults(prev => [...prev, ...data.items]);
      }
      
      setTotalPages(data.page_total);
      setTotalCount(data.total_count || data.items.length * data.page_total);
      
      if (!searchHistory.includes(searchParams.keyword)) {
        setSearchHistory(prev => [searchParams.keyword, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || searchParams.page >= totalPages || showSelectedOnly) return;
    
    setIsLoadingMore(true);
    const nextPage = searchParams.page + 1;
    
    try {
      const updatedParams = {
        ...searchParams,
        page: nextPage,
        seller: isCompanyOnly ? 'myniw58319' : searchParams.seller,
      };
      
      const response = await fetch(buildSearchUrl(updatedParams));
      if (!response.ok) throw new Error('検索中にエラーが発生しました');
      
      const data: ApiResponse = await response.json();
      setResults(prev => [...prev, ...data.items]);
      setTotalPages(data.page_total);
      setTotalCount(data.total_count || data.items.length * data.page_total);
      setSearchParams(updatedParams);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoadingMore(false);
    }
  }, [searchParams, totalPages, isLoading, isLoadingMore, isCompanyOnly, showSelectedOnly]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelectedItems = () => {
    setSelectedItems(new Set());
    if (showSelectedOnly) {
      setShowSelectedOnly(false);
    }
  };

  const getProductTags = (title: string): ProductTag[] => {
    return PRODUCT_TAGS.filter(tag => title.includes(tag.keyword));
  };

  const toggleTagFilter = (keyword: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    results.forEach(item => {
      const itemTags = getProductTags(item.商品名);
      itemTags.forEach(tag => {
        tagCounts.set(tag.keyword, (tagCounts.get(tag.keyword) || 0) + 1);
      });
    });

    return PRODUCT_TAGS
      .map(tag => ({
        tag,
        count: tagCounts.get(tag.keyword) || 0
      }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Apply selected items filter
    if (showSelectedOnly) {
      filtered = filtered.filter(item => selectedItems.has(item.オークションID));
    }

    // Apply tag filters
    if (selectedTags.size > 0) {
      filtered = filtered.filter(item => {
        const itemTags = getProductTags(item.商品名);
        return itemTags.some(tag => selectedTags.has(tag.keyword));
      });
    }

    // Apply keyword filter
    if (filterOptions.filterKeywords.length > 0) {
      filtered = filtered.filter(item => 
        filterOptions.filterKeywords.every(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply exclude keyword filter
    if (filterOptions.excludeKeywords.length > 0) {
      filtered = filtered.filter(item => 
        !filterOptions.excludeKeywords.some(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply multiple bids filter
    if (filterOptions.excludeMultipleBids) {
      filtered = filtered.filter(item => item.入札数 >= 2);
    }

    // Apply no junk filter
    if (filterOptions.excludeJunk) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('ジャンク') && !item.商品名.includes('現状品')
      );
    }

    // Apply no sets filter
    if (filterOptions.excludeSets) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('まとめ') && !item.商品名.includes('セット')
      );
    }

    // Apply no new items filter
    if (filterOptions.excludeNew) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('新品') && 
        !item.商品名.includes('未使用') && 
        !item.商品名.includes('未開封')
      );
    }

    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.落札金額 - b.落札金額;
        } else {
          return b.落札金額 - a.落札金額;
        }
      });
    }

    return filtered;
  }, [results, filterOptions, sortOrder, selectedItems, showSelectedOnly, selectedTags]);

  const calculateStatistics = (items: AuctionItem[]): Statistics | null => {
    if (items.length === 0) return null;

    const prices = items.map(item => item.落札金額);
    const sum = prices.reduce((a, b) => a + b, 0);
    const sorted = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const step = range / 10;

    const priceRanges = Array.from({ length: 10 }, (_, i) => {
      const rangeStart = min + (step * i);
      const rangeEnd = min + (step * (i + 1));
      return {
        range: `¥${Math.round(rangeStart).toLocaleString()} ~ ¥${Math.round(rangeEnd).toLocaleString()}`,
        count: 0,
        rangeStart,
        rangeEnd
      };
    });

    prices.forEach(price => {
      const rangeIndex = priceRanges.findIndex(range => 
        price >= range.rangeStart && price < range.rangeEnd
      );
      if (rangeIndex >= 0) {
        priceRanges[rangeIndex].count++;
      }
    });

    return {
      median: sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle],
      average: sum / prices.length,
      max,
      min,
      priceRanges: priceRanges.map(({ range, count }) => ({ range, count }))
    };
  };

  const statistics = useMemo(() => calculateStatistics(filteredResults), [filteredResults]);
  const selectedStatistics = useMemo(() => {
    const selectedResultItems = results.filter(item => selectedItems.has(item.オークションID));
    return calculateStatistics(selectedResultItems);
  }, [results, selectedItems]);

  // 検索ボックス外のクリックを監視
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsHistoryVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsTagsVisible(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {results.length === 0 && !currentSearchKeyword ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ヤフオク相場検索</h1>
          <p className="text-gray-600 text-lg mb-8">過去の落札商品から価格相場をリサーチ</p>
          <div className="w-full max-w-2xl px-4">
            <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                  type="text"
                      inputMode="search"
                      enterKeyHint="search"
                      value={searchParams.keyword}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                  onFocus={() => setIsHistoryVisible(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (searchInputRef.current) {
                        searchInputRef.current.blur();
                      }
                      setIsHistoryVisible(false);
                      handleSearch(e);
                    }
                  }}
                  placeholder="すべてのアイテムから探す"
                  className="w-full px-6 py-4 pr-16 text-lg border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:shadow-md transition-shadow duration-200 bg-white"
                />
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
              {isHistoryVisible && searchHistory.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
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
            {isAdvancedSearch && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-4 md:space-y-0 md:flex md:gap-4 w-full">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        除外キーワード
                      </label>
                      <input
                        type="text"
                        value={searchParams.negative_keyword}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, negative_keyword: e.target.value }))}
                        placeholder="除外するキーワード"
                        className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        商品の状態（一部対応）
                      </label>
                      <select
                        value={searchParams.status}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white"
                      >
                        <option value="">すべて</option>
                        <option value="new">新品</option>
                        <option value="used">中古</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        出品者ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchParams.seller}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, seller: e.target.value }))}
                          placeholder="出品者のID"
                          className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
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
                          setSearchParams(prev => ({ ...prev, seller: 'myniw58319' }));
                        } else {
                          setSearchParams(prev => ({ ...prev, seller: '' }));
                        }
                      }}
                            className="h-3 w-3 text-gray-600 bg-gray-800/60 border-gray-700 rounded"
                    />
                          <label htmlFor="companyOnly" className="ml-1 text-xs text-gray-400">
                            自社
                    </label>
                  </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        価格範囲
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={searchParams.min}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, min: e.target.value }))}
                          placeholder="¥1000"
                          className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                        />
                        <span className="text-gray-400">~</span>
                        <input
                          type="number"
                          value={searchParams.max}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, max: e.target.value }))}
                          placeholder="¥5000"
                          className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchParams(prev => ({
                        ...prev,
                        negative_keyword: '',
                        status: '',
                        seller: '',
                        min: '',
                        max: ''
                      }));
                      setIsCompanyOnly(false);
                    }}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                  >
                    <X size={14} />
                    詳細条件をクリア
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center h-14">
                <h1 className="hidden md:block text-lg font-bold text-white mr-8 whitespace-nowrap">ヤフオク相場検索</h1>
                <div className="flex items-center flex-1 max-w-3xl gap-2">
                  <div className="relative flex-1" ref={searchContainerRef}>
                    <form onSubmit={handleSearch} className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          inputMode="search"
                          enterKeyHint="search"
                          value={searchParams.keyword}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                          onFocus={() => setIsHistoryVisible(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (searchInputRef.current) {
                                searchInputRef.current.blur();
                              }
                              setIsHistoryVisible(false);
                              handleSearch(e);
                            }
                          }}
                          placeholder="すべてのアイテムから探す"
                          className="w-full pl-9 pr-10 py-1.5 bg-gray-700/50 border border-gray-700 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                        />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="shrink-0 px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Search size={16} />
                        <span className="hidden md:inline">検索</span>
                      </button>
                    </form>
                  </div>
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
                      {!isAdvancedSearch && Object.entries(searchParams).some(([key, value]) => {
                        if (key === 'keyword' || key === 'page') return false;
                        return value && value.length > 0;
                      }) && (
                        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-current border-opacity-20">
                          {searchParams.negative_keyword && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">除外</span>
                          )}
                          {searchParams.status && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">
                              {searchParams.status === 'new' ? '新品' : '中古'}
                            </span>
                          )}
                          {searchParams.seller && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">出品者</span>
                          )}
                          {(searchParams.min || searchParams.max) && (
                            <span className="inline-flex items-center px-1.5 rounded bg-gray-800/80 text-[10px]">価格</span>
                          )}
                        </div>
                      )}
                  </button>
                    <button
                      onClick={() => {
                        setSortOrder(order => {
                          if (order === 'none') return 'asc';
                          if (order === 'asc') return 'desc';
                          return 'none';
                        });
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                        sortOrder === 'none' 
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={14} /> : sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
                      {sortOrder === 'none' ? '価格順' : sortOrder === 'asc' ? '価格: 安い順' : '価格: 高い順'}
                    </button>
                  </div>
                </div>
                <div className="hidden md:block ml-8">
                  <div className="text-sm text-gray-300">
                    <span className="font-bold text-lg text-white">{totalCount.toLocaleString()}</span>
                    <span className="mx-1">件中</span>
                    <span className="font-bold text-lg text-white">{filteredResults.length.toLocaleString()}</span>
                    <span className="mx-1">件表示</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
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
                  {isAdvancedSearch && (
                <div className="py-3 border-t border-gray-800">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-4 md:space-y-0 md:flex md:gap-4 w-full">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          除外キーワード
                        </label>
                        <input
                          type="text"
                          value={searchParams.negative_keyword}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, negative_keyword: e.target.value }))}
                          placeholder="除外するキーワード"
                          className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          商品の状態（一部対応）
                        </label>
                        <select
                          value={searchParams.status}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white"
                        >
                          <option value="">すべて</option>
                          <option value="new">新品</option>
                          <option value="used">中古</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            出品者ID
                          </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchParams.seller}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, seller: e.target.value }))}
                            placeholder="出品者のID"
                            className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
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
                                  setSearchParams(prev => ({ ...prev, seller: 'myniw58319' }));
                                } else {
                                  setSearchParams(prev => ({ ...prev, seller: '' }));
                                }
                              }}
                              className="h-3 w-3 text-gray-600 bg-gray-800/60 border-gray-700 rounded"
                            />
                            <label htmlFor="companyOnly" className="ml-1 text-xs text-gray-400">
                              自社
                            </label>
                        </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          価格範囲
                          </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={searchParams.min}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, min: e.target.value }))}
                            placeholder="¥1000"
                            className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                          />
                          <span className="text-gray-400">~</span>
                          <input
                            type="number"
                            value={searchParams.max}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, max: e.target.value }))}
                            placeholder="¥5000"
                            className="w-full px-3 py-2 md:py-1.5 bg-gray-800/60 border border-gray-700 rounded text-sm text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setSearchParams(prev => ({
                          ...prev,
                          negative_keyword: '',
                          status: '',
                          seller: '',
                          min: '',
                          max: ''
                        }));
                        setIsCompanyOnly(false);
                      }}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                    >
                      <X size={14} />
                      詳細条件をクリア
                    </button>
                      </div>
                    </div>
                  )}
              </div>
          </header>

          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Search Panel */}
                <div className="md:col-span-1">
                  <div className="md:sticky md:top-[calc(3.5rem+1px+1rem)] space-y-4 max-h-[calc(100vh-3.5rem-1px-2rem)] overflow-y-auto">
                    {/* Tags and Filters panel */}
                    {results.length > 0 && (
                      <div className="bg-white rounded-lg shadow p-3">
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
                              {results.length.toLocaleString()}件
                              {(selectedTags.size > 0 || filterKeyword || filterOptions.excludeMultipleBids || filterOptions.excludeJunk || filterOptions.excludeSets || filterOptions.excludeNew) && (
                                <>
                                  <span className="mx-0.5">→</span>
                                  {filteredResults.length.toLocaleString()}件
                                </>
                              )}
                            </span>
                  </div>
                          <div className="flex items-center gap-1.5">
                            {(selectedTags.size > 0 || filterKeyword || filterOptions.excludeMultipleBids || filterOptions.excludeJunk || filterOptions.excludeSets) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTags(new Set());
                                  setFilterKeyword('');
                                  setFilterOptions({
                                    selectedTags: [],
                                    excludeMultipleBids: false,
                                    excludeJunk: false,
                                    excludeKeywords: [],
                                    excludeSets: false,
                                    excludeNew: false,
                                    filterKeywords: []
                                  });
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
                        {isTagsVisible && (
                          <div className="space-y-4">
                              {/* 含む系 */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                                  <div className="text-xs font-bold text-gray-600">含む</div>
                                </div>

                                {/* 含むキーワード */}
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                      type="text"
                                      value={newFilterKeyword}
                                      onChange={(e) => setNewFilterKeyword(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newFilterKeyword.trim()) {
                                          setFilterOptions(prev => ({
                                            ...prev,
                                            filterKeywords: [...prev.filterKeywords, newFilterKeyword.trim()]
                                          }));
                                          setNewFilterKeyword('');
                                        }
                                      }}
                                      placeholder="含むキーワード"
                                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
                                    />
                                    {newFilterKeyword && (
                                      <button
                                        onClick={() => {
                                          if (newFilterKeyword.trim()) {
                                            setFilterOptions(prev => ({
                                              ...prev,
                                              filterKeywords: [...prev.filterKeywords, newFilterKeyword.trim()]
                                            }));
                                            setNewFilterKeyword('');
                                          }
                                        }}
                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                      >
                                        <CheckCircle2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                  {filterOptions.filterKeywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {filterOptions.filterKeywords.map((keyword, index) => (
                                        <span
                        key={index}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                                        >
                                          {keyword}
                                          <button
                                            onClick={() => setFilterOptions(prev => ({
                                              ...prev,
                                              filterKeywords: prev.filterKeywords.filter((_, i) => i !== index)
                                            }))}
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

                              {/* 除外系 */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                                  <div className="text-xs font-bold text-gray-600">除外</div>
                                </div>

                                {/* 除外キーワード */}
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
                                          setFilterOptions(prev => ({
                                            ...prev,
                                            excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword.trim()]
                                          }));
                                          setNewExcludeKeyword('');
                                        }
                                      }}
                                      placeholder="除外キーワード"
                                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
                                    />
                                    {newExcludeKeyword && (
                                      <button
                                        onClick={() => {
                                          if (newExcludeKeyword.trim()) {
                                            setFilterOptions(prev => ({
                                              ...prev,
                                              excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword.trim()]
                                            }));
                                            setNewExcludeKeyword('');
                                          }
                                        }}
                                        className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                      >
                                        <CheckCircle2 size={16} />
                                      </button>
                    )}
                  </div>
                                  {filterOptions.excludeKeywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {filterOptions.excludeKeywords.map((keyword, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs"
                                        >
                                          {keyword}
                  <button
                                            onClick={() => setFilterOptions(prev => ({
                                              ...prev,
                                              excludeKeywords: prev.excludeKeywords.filter((_, i) => i !== index)
                                            }))}
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
                                      セット
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
                                </div>
                              </div>

                              {/* クリアボタン */}
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
                    )}

                    {/* Statistics panel in sidebar */}
                    {results.length > 0 && statistics && (
                      <div className="bg-white rounded-lg shadow p-3 transition-all duration-300">
                        <button
                          onClick={() => setIsStatsVisible(!isStatsVisible)}
                          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <Calculator size={16} />
                            統計情報
                          </div>
                          {isStatsVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isStatsVisible && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-100 rounded-md p-2">
                              <div className="text-sm text-gray-600 mb-0.5">中央値</div>
                              <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.median.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-100 rounded-md p-2">
                              <div className="text-sm text-gray-600 mb-0.5">平均値</div>
                              <div className="font-bold text-gray-900 text-lg text-center">¥{Math.round(statistics.average).toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-100 rounded-md p-2">
                              <div className="text-sm text-gray-600 mb-0.5">最高値</div>
                              <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.max.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-100 rounded-md p-2">
                              <div className="text-sm text-gray-600 mb-0.5">最安値</div>
                              <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.min.toLocaleString()}</div>
                            </div>
                          </div>
                        )}
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {isLoading && results.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-500 mb-4"></div>
                      <div className="text-gray-600">検索中...</div>
              </div>
            ) : results.length > 0 ? (
              <>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white rounded-lg shadow p-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span>
                            <span className="mx-1">件中</span>
                            <span className="font-bold text-gray-900">{filteredResults.length.toLocaleString()}</span>
                            <span className="mx-1">件表示</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Package2 size={16} />
                              <span>{filteredResults.length.toLocaleString()}件</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              {/* レイアウト切り替えボタン */}
                              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                        <button
                                  onClick={() => setLayout('grid')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                                    layout === 'grid'
                                      ? 'bg-white text-gray-700 shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  グリッド
                        </button>
                        <button
                                  onClick={() => setLayout('table')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                                    layout === 'table'
                                      ? 'bg-white text-gray-700 shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  テーブル
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSortOrder(order => {
                            if (order === 'none') return 'asc';
                            if (order === 'asc') return 'desc';
                            return 'none';
                          });
                        }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                          sortOrder === 'none' 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {sortOrder === 'asc' ? <ArrowUp size={14} /> : sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
                        {sortOrder === 'none' ? '価格順' : sortOrder === 'asc' ? '価格: 安い順' : '価格: 高い順'}
                      </button>
                        </div>
                      </div>
                    </div>
                  {statistics && (
                          <div className="hidden md:block bg-white rounded-lg shadow p-3">
                            <div className="grid grid-cols-4 gap-2">
                              <div className="bg-gray-100 rounded-md p-2">
                                <div className="text-sm text-gray-600 mb-0.5">中央値</div>
                                <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.median.toLocaleString()}</div>
                        </div>
                              <div className="bg-gray-100 rounded-md p-2">
                                <div className="text-sm text-gray-600 mb-0.5">平均値</div>
                                <div className="font-bold text-gray-900 text-lg text-center">¥{Math.round(statistics.average).toLocaleString()}</div>
                        </div>
                              <div className="bg-gray-100 rounded-md p-2">
                                <div className="text-sm text-gray-600 mb-0.5">最高値</div>
                                <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.max.toLocaleString()}</div>
                        </div>
                              <div className="bg-gray-100 rounded-md p-2">
                                <div className="text-sm text-gray-600 mb-0.5">最安値</div>
                                <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.min.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mt-4 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statistics.priceRanges}>
                            <XAxis 
                              dataKey="range" 
                              angle={-45}
                              textAnchor="end"
                              height={80}
                              interval={0}
                              tick={{fontSize: 10}}
                            />
                            <YAxis />
                                  <RechartsTooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                          </div>
                  )}
                </div>

                      <div className="mt-4">
                        {layout === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredResults.map((item) => (
                    <div
                      key={item.オークションID}
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group"
                    >
                      <button
                                  onClick={(e) => {
                                    if (e.shiftKey && selectedItems.size > 0) {
                                      const currentIndex = filteredResults.findIndex(i => i.オークションID === item.オークションID);
                                      const lastSelectedIndex = filteredResults.findIndex(i => i.オークションID === Array.from(selectedItems)[selectedItems.size - 1]);
                                      const start = Math.min(currentIndex, lastSelectedIndex);
                                      const end = Math.max(currentIndex, lastSelectedIndex);
                                      const newSelectedItems = new Set(selectedItems);
                                      
                                      // 範囲内の全ての項目を選択
                                      for (let i = start; i <= end; i++) {
                                        newSelectedItems.add(filteredResults[i].オークションID);
                                      }
                                      
                                      setSelectedItems(newSelectedItems);
                                    } else {
                                      toggleItemSelection(item.オークションID);
                                    }
                                  }}
                        className={`absolute top-2 right-2 z-10 p-1 rounded-full ${
                          selectedItems.has(item.オークションID)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {selectedItems.has(item.オークションID) ? (
                        <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <a
                        href={getAuctionUrl(item.オークションID)}
                        target="_blank"
                        rel="noopener noreferrer"
                                  className="block"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={item.画像URL}
                            alt={item.商品名}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                            }}
                          />
                                    <div className="absolute top-0 left-0 p-2 flex flex-wrap gap-1 max-w-[calc(100%-48px)]">
                                {getProductTags(item.商品名).map((tag, index) => (
                                  <span
                                    key={index}
                                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tag.color} shadow-sm backdrop-blur-[2px]`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                                    <div className="absolute bottom-0 left-0 px-2 py-1 m-2 rounded bg-black/60 backdrop-blur-[2px]">
                                      <div className="flex items-center gap-2">
                                        <div className="text-white text-lg font-bold drop-shadow">¥{item.落札金額.toLocaleString()}</div>
                                        <div className="text-white text-xs font-medium">{item.入札数}件</div>
                            </div>
                          </div>
                                  </div>
                                  <div className="p-2">
                                    <div className="space-y-1">
                                      <h3 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
                                        {item.商品名}
                                      </h3>
                                      <div className="flex items-center text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Calendar size={12} />
                              <span>{item.終了日}</span>
                            </div>
                          </div>
                          </div>
                          </div>
                                </a>
                        </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-50">
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-8">
                                      <button
                                        onClick={() => {
                                          if (selectedItems.size === filteredResults.length) {
                                            clearSelectedItems();
                                          } else {
                                            setSelectedItems(new Set(filteredResults.map(item => item.オークションID)));
                                          }
                                        }}
                                        className={`p-1 rounded-full transition-opacity duration-200 ${
                                          selectedItems.size === filteredResults.length
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white text-gray-400 border'
                                        }`}
                                      >
                                        {selectedItems.size === filteredResults.length ? (
                                          <CheckCircle2 size={16} />
                                        ) : (
                                          <Circle size={16} />
                                        )}
                                      </button>
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">商品名</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">現在価格</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">入札数</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">終了日時</th>
                                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-10"></th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {filteredResults.map((item) => (
                                    <tr key={item.オークションID} className="group hover:bg-gray-50">
                                      <td className="px-2 py-3">
                                        <button
                                          onClick={(e) => {
                                            if (e.shiftKey && selectedItems.size > 0) {
                                              const currentIndex = filteredResults.findIndex(i => i.オークションID === item.オークションID);
                                              const lastSelectedIndex = filteredResults.findIndex(i => i.オークションID === Array.from(selectedItems)[selectedItems.size - 1]);
                                              const start = Math.min(currentIndex, lastSelectedIndex);
                                              const end = Math.max(currentIndex, lastSelectedIndex);
                                              const newSelectedItems = new Set(selectedItems);
                                              
                                              // 範囲内の全ての項目を選択
                                              for (let i = start; i <= end; i++) {
                                                newSelectedItems.add(filteredResults[i].オークションID);
                                              }
                                              
                                              setSelectedItems(newSelectedItems);
                                            } else {
                                              toggleItemSelection(item.オークションID);
                                            }
                                          }}
                                          className={`p-1 rounded-full transition-opacity duration-200 ${
                                            selectedItems.has(item.オークションID)
                                              ? 'bg-blue-500 text-white opacity-100'
                                              : 'bg-white text-gray-400 border opacity-0 group-hover:opacity-100'
                                          }`}
                                        >
                                          {selectedItems.has(item.オークションID) ? (
                                            <CheckCircle2 size={16} />
                                          ) : (
                                            <Circle size={16} />
                                          )}
                                        </button>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-start gap-3">
                                          <div className="relative flex-shrink-0">
                                            <img
                                              src={item.画像URL}
                                              alt={item.商品名}
                                              className="w-16 h-16 object-cover bg-white rounded border cursor-pointer hover:ring-2 hover:ring-blue-500"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                                              }}
                                              onMouseMove={(e) => {
                                                const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (tooltip) {
                                                  const rect = e.currentTarget.getBoundingClientRect();
                                                  tooltip.style.top = `${rect.top}px`;
                                                  tooltip.style.left = `${rect.left}px`;
                                                  tooltip.style.opacity = '1';
                                                  tooltip.style.visibility = 'visible';
                                                }
                                              }}
                                              onMouseLeave={(e) => {
                                                const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                                if (tooltip) {
                                                  tooltip.style.opacity = '0';
                                                  tooltip.style.visibility = 'hidden';
                                                }
                                              }}
                                            />
                                            <div className="fixed opacity-0 invisible transition-all duration-200 z-50 pointer-events-none" style={{ transform: 'translateX(-100%)', marginLeft: '-20px' }}>
                                              <div className="bg-white rounded-lg shadow-xl p-2">
                                                <img
                                                  src={item.画像URL}
                                                  alt={item.商品名}
                                                  className="w-64 h-64 object-contain"
                                                  onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <a
                                              href={getAuctionUrl(item.オークションID)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-gray-900 hover:text-blue-600 line-clamp-2"
                                            >
                                              {item.商品名}
                                            </a>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {getProductTags(item.商品名).map((tag, index) => (
                                                <span
                                                  key={index}
                                                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${tag.color}`}
                                                >
                                                  {tag.label}
                                                </span>
                                              ))}
                    </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                          ¥{item.落札金額.toLocaleString()}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.入札数}件</div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{item.終了日}</div>
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <a
                                          href={getAuctionUrl(item.オークションID)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700"
                                        >
                                          <ExternalLink size={12} />
                                          開く
                                        </a>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                </div>

                      {/* Loading indicator for infinite scroll */}
                      {!isLoading && searchParams.page < totalPages && !showSelectedOnly && selectedTags.size === 0 && (
                  <div ref={observerTarget} className="mt-8 mb-4">
                          <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-gray-600">次のページを読み込み中...</span>
                            </div>
                    </div>
                  </div>
                )}
              </>
                  ) : currentSearchKeyword ? (
                    <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
                      <div className="text-gray-500 text-center">
                        <div className="mb-2 text-lg font-medium">検索結果が見つかりませんでした</div>
                        <div className="text-sm">検索条件を変更して、もう一度お試しください</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
                      <div className="text-gray-500 text-center">
                        <div className="mb-2 text-lg font-medium">商品を検索してください</div>
                        <div className="text-sm">過去の落札価格をチェックして、適正価格を把握できます</div>
                      </div>
              </div>
            )}
          </div>
        </div>
      </div>
          </main>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
          aria-label="ページ上部へ戻る"
        >
          <ArrowUpToLine size={20} />
        </button>
      )}

      {/* Selected items statistics floating panel */}
      {selectedItems.size > 0 && (
        <div className="fixed top-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-xs w-full transition-all duration-300 z-50">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900">選択した商品の統計</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{selectedItems.size}件</span>
                <button
                  onClick={clearSelectedItems}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  title="選択をクリア"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {selectedStatistics && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 rounded-md p-2">
                  <div className="text-sm text-gray-600 mb-0.5">中央値</div>
                  <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.median.toLocaleString()}</div>
                </div>
                <div className="bg-gray-100 rounded-md p-2">
                  <div className="text-sm text-gray-600 mb-0.5">平均価格</div>
                  <div className="font-bold text-gray-900 text-lg">¥{Math.round(selectedStatistics.average).toLocaleString()}</div>
                </div>
                <div className="bg-gray-100 rounded-md p-2">
                  <div className="text-sm text-gray-600 mb-0.5">最高値</div>
                  <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.max.toLocaleString()}</div>
                </div>
                <div className="bg-gray-100 rounded-md p-2">
                  <div className="text-sm text-gray-600 mb-0.5">最安値</div>
                  <div className="font-bold text-gray-900 text-lg">¥{selectedStatistics.min.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className={`w-full px-3 py-2 rounded text-sm font-medium ${
              showSelectedOnly
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showSelectedOnly ? '全ての商品を表示' : '選択した商品のみ表示'}
          </button>
        </div>
      )}

      {showHelp && <HelpPage onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;