import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, History, Package2, CircleDollarSign, ChevronLeft, ChevronRight, ExternalLink, ArrowUpDown, Calculator, ArrowUp, ArrowDown, ChevronDown, ChevronUp, X, ArrowUpToLine, CheckCircle2, Trash2, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  multipleBids: boolean;
  noJunk: boolean;
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
}

interface TagCount {
  tag: ProductTag;
  count: number;
}

type SortOrder = 'none' | 'asc' | 'desc';

const PRODUCT_TAGS: ProductTag[] = [
  { keyword: '新品', label: '新品', color: 'bg-green-100 text-green-800' },
  { keyword: '未使用', label: '未使用', color: 'bg-emerald-100 text-emerald-800' },
  { keyword: '未開封', label: '未開封', color: 'bg-teal-100 text-teal-800' },
  { keyword: 'ジャンク', label: 'ジャンク', color: 'bg-red-100 text-red-800' },
  { keyword: '現状', label: '現状品', color: 'bg-orange-100 text-orange-800' },
  { keyword: '美品', label: '美品', color: 'bg-blue-100 text-blue-800' },
  { keyword: '送料無料', label: '送料無料', color: 'bg-purple-100 text-purple-800' },
  { keyword: '訳あり', label: '訳あり', color: 'bg-amber-100 text-amber-800' },
  { keyword: 'まとめ', label: 'まとめ', color: 'bg-indigo-100 text-indigo-800' },
  { keyword: 'セット', label: 'セット', color: 'bg-violet-100 text-violet-800' },
];

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
    multipleBids: false,
    noJunk: false,
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const buildSearchUrl = (params: SearchParams) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.append(key, value.toString());
      }
    });
    return `https://revathis-api.vercel.app/api/aucfree?${urlParams.toString()}`;
  };

  const handleSearch = async (e: React.FormEvent, newPage?: number) => {
    e?.preventDefault();
    if (!searchParams.keyword.trim()) return;

    const isNewSearch = searchParams.keyword !== currentSearchKeyword;
    
    setIsLoading(true);
    setError(null);

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
        setCurrentSearchKeyword(searchParams.keyword);
        setSelectedTags(new Set()); // Reset selected tags on new search
      } else {
        setResults(prev => [...prev, ...data.items]);
      }
      
      setTotalPages(data.page_total);
      setTotalCount(data.total_count || data.items.length * data.page_total);
      
      if (!searchHistory.includes(searchParams.keyword)) {
        setSearchHistory(prev => [searchParams.keyword, ...prev.slice(0, 4)]);
      }

      // Close keyboard on mobile after search
      if (searchInputRef.current) {
        searchInputRef.current.blur();
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
    if (isLoading || isLoadingMore || searchParams.page >= totalPages) return;
    setIsLoadingMore(true);
    await handleSearch(null as any, searchParams.page + 1);
  }, [searchParams.page, totalPages, isLoading, isLoadingMore]);

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
    if (filterKeyword.trim()) {
      const keywords = filterKeyword.toLowerCase().split(/\s+/);
      filtered = filtered.filter(item => 
        keywords.every(keyword => 
          item.商品名.toLowerCase().includes(keyword)
        )
      );
    }

    // Apply multiple bids filter
    if (filterOptions.multipleBids) {
      filtered = filtered.filter(item => item.入札数 >= 2);
    }

    // Apply no junk filter
    if (filterOptions.noJunk) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('ジャンク') && !item.商品名.includes('現状品')
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
  }, [results, filterOptions, sortOrder, filterKeyword, selectedItems, showSelectedOnly, selectedTags]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ヤフオク過去落札検索</h1>
          <p className="text-gray-600">過去の落札価格をチェックして、適正価格を把握しましょう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search Panel */}
          <div className="md:col-span-1">
            <div className="md:sticky md:top-4 space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="search"
                      inputMode="search"
                      enterKeyHint="search"
                      value={searchParams.keyword}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                      placeholder="商品名を入力"
                      className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      {searchParams.keyword && (
                        <button
                          type="button"
                          onClick={() => setSearchParams(prev => ({ ...prev, keyword: '' }))}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-gray-600 p-1"
                        disabled={isLoading}
                      >
                        <Search size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
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
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label htmlFor="companyOnly" className="ml-2 text-sm text-gray-700">
                      自社商品のみ表示
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                    className="text-sm text-blue-600 hover:text-blue-800 w-full text-left"
                  >
                    {isAdvancedSearch ? '詳細検索を閉じる' : '詳細検索を開く'}
                  </button>

                  {isAdvancedSearch && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          除外キーワード
                        </label>
                        <input
                          type="text"
                          value={searchParams.negative_keyword}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, negative_keyword: e.target.value }))}
                          placeholder="除外するキーワード"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          商品の状態
                        </label>
                        <select
                          value={searchParams.status}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                        >
                          <option value="">すべて</option>
                          <option value="new">新品</option>
                          <option value="used">中古</option>
                        </select>
                      </div>
                      {!isCompanyOnly && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            出品者ID
                          </label>
                          <input
                            type="text"
                            value={searchParams.seller}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, seller: e.target.value }))}
                            placeholder="出品者のID"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            最低価格
                          </label>
                          <input
                            type="number"
                            value={searchParams.min}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, min: e.target.value }))}
                            placeholder="¥1000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            最高価格
                          </label>
                          <input
                            type="number"
                            value={searchParams.max}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, max: e.target.value }))}
                            placeholder="¥5000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <button
                  onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <History size={16} />
                    検索履歴
                  </div>
                  {isHistoryVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isHistoryVisible && (
                  <ul className="space-y-2 mt-2">
                    {searchHistory.map((term, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 hover:text-blue-500 cursor-pointer"
                        onClick={() => setSearchParams(prev => ({ ...prev, keyword: term }))}
                      >
                        {term}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedItems.size > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">選択した商品の統計</h3>
                      <button
                        onClick={clearSelectedItems}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        title="選択をクリア"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {selectedStatistics && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">平均価格:</span>
                          <span className="font-semibold">¥{Math.round(selectedStatistics.average).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">中央値:</span>
                          <span className="font-semibold">¥{selectedStatistics.median.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">最高値:</span>
                          <span className="font-semibold">¥{selectedStatistics.max.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">最安値:</span>
                          <span className="font-semibold">¥{selectedStatistics.min.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">選択数:</span>
                          <span className="font-semibold">{selectedItems.size}件</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                      showSelectedOnly
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showSelectedOnly ? '全ての商品を表示' : '選択した商品のみ表示'}
                  </button>
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
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="bg-white rounded-lg shadow p-4 mb-4">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilterOptions(prev => ({ ...prev, multipleBids: !prev.multipleBids }))}
                          className={`px-3 py-2 border rounded-md text-sm ${
                            filterOptions.multipleBids
                              ? 'bg-blue-50 text-blue-700 border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          複数入札のみ
                        </button>
                        <button
                          onClick={() => setFilterOptions(prev => ({ ...prev, noJunk: !prev.noJunk }))}
                          className={`px-3 py-2 border rounded-md text-sm ${
                            filterOptions.noJunk
                              ? 'bg-blue-50 text-blue-700 border-blue-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          ジャンクを除く
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
                        className={`flex items-center gap-1 px-3 py-2 border rounded-md text-sm hover:bg-gray-50 ${
                          sortOrder === 'none' 
                            ? 'border-gray-300 bg-white' 
                            : 'border-blue-500 bg-blue-50 text-blue-700'
                        }`}
                      >
                        {sortOrder === 'asc' ? <ArrowUp size={14} /> : sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
                        {sortOrder === 'none' ? '価格順' : sortOrder === 'asc' ? '価格: 安い順' : '価格: 高い順'}
                      </button>
                      <div className="relative flex-1 min-w-[200px]">
                        <div className="relative">
                          <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                          <input
                            type="text"
                            value={filterKeyword}
                            onChange={(e) => setFilterKeyword(e.target.value)}
                            placeholder="キーワードで絞込み"
                            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
                          />
                          {filterKeyword && (
                            <button
                              onClick={() => setFilterKeyword('')}
                              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-lg text-gray-900">{totalCount.toLocaleString()}</span>
                      <span className="ml-1">件中</span>
                      <span className="ml-1">{filteredResults.length.toLocaleString()}</span>
                      <span className="ml-1">件表示中</span>
                    </div>
                  </div>

                  {/* Available tags for filtering */}
                  {availableTags.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm font-medium text-gray-700 mb-2">商品タグで絞り込み:</div>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(({ tag, count }) => (
                          <button
                            key={tag.keyword}
                            onClick={() => toggleTagFilter(tag.keyword)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                              selectedTags.has(tag.keyword)
                                ? `${tag.color.replace('bg-', 'bg-opacity-100 ')} font-bold`
                                : tag.color.replace('bg-', 'bg-opacity-50 hover:bg-opacity-75 ')
                            }`}
                          >
                            {selectedTags.has(tag.keyword) && (
                              <CheckCircle2 size={14} className="flex-shrink-0" />
                            )}
                            <span>{tag.label}</span>
                            <span className={`bg-white px-1.5 py-0.5 rounded-full text-xs ${
                              selectedTags.has(tag.keyword) ? 'bg-opacity-75' : 'bg-opacity-50'
                            }`}>
                              {count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {statistics && (
                    <>
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">中央値</div>
                          <div className="text-xl font-bold text-gray-900">¥{statistics.median.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">平均値</div>
                          <div className="text-xl font-bold text-gray-900">¥{Math.round(statistics.average).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">最高値</div>
                          <div className="text-xl font-bold text-gray-900">¥{statistics.max.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">最安値</div>
                          <div className="text-xl font-bold text-gray-900">¥{statistics.min.toLocaleString()}</div>
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
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredResults.map((item) => (
                    <div
                      key={item.オークションID}
                      className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group"
                    >
                      <button
                        onClick={() => toggleItemSelection(item.オークションID)}
                        className={`absolute top-2 right-2 z-10 p-1 rounded-full ${
                          selectedItems.has(item.オークションID)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <a
                        href={getAuctionUrl(item.オークションID)}
                        target="_blank"
                        rel="noopener noreferrer"
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
                        </div>
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div className="space-y-2">
                              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{item.商品名}</h3>
                              <div className="flex flex-wrap gap-1">
                                {getProductTags(item.商品名).map((tag, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Package2 size={14} />
                              <span>{item.終了日}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-1">
                            <CircleDollarSign size={16} className="text-green-600" />
                            <span className="text-lg font-bold text-green-600">¥{item.落札金額.toLocaleString()}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            入札数: {item.入札数}件
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>

                {/* Enhanced loading indicator for infinite scroll */}
                {!isLoading && searchParams.page < totalPages && (
                  <div ref={observerTarget} className="mt-8 mb-4">
                    <div className="flex items-center justify-center gap-3 bg-white rounded-lg shadow p-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-gray-600">次のページを読み込み中...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-12">
                商品を検索してください
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}

export default App;