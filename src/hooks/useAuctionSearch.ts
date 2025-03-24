import { useState, useCallback } from 'react';
import { AuctionItem, ApiResponse, SearchParams, FilterOptions } from '../types';

/**
 * オークション検索機能を提供するカスタムフック
 * 検索やページネーションなど、APIとのやり取りに関するロジックを管理
 */
export const useAuctionSearch = () => {
  // State declarations
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    page: 1,
    excludeKeywords: [],
    status: '',
    sellerId: '',
    minPrice: '',
    maxPrice: '',
  });
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [results, setResults] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCompanyOnly, setIsCompanyOnly] = useState(false);

  /**
   * オークション商品のURLを生成する関数
   * @param auctionId - オークションID
   * @param endDate - 落札日（文字列形式）
   * @returns オークション商品のURL
   */
  const getAuctionUrl = (auctionId: string, endDate: string) => {
    // 落札日をDate型に変換
    const endDateTime = new Date(endDate);
    // 現在の日付
    const now = new Date();
    // 日付の差分を計算（ミリ秒単位）
    const diffTime = Math.abs(now.getTime() - endDateTime.getTime());
    // 日数に変換
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 180日以内の場合はヤフオクのページへ、それより古い場合はAucFreeへ
    if (diffDays <= 180) {
      return `https://page.auctions.yahoo.co.jp/jp/auction/${auctionId}`;
    } else {
      return `https://aucfree.com/items/${auctionId}`;
    }
  };

  /**
   * 検索URLを構築する関数
   * @param params - 検索パラメータ
   * @param options - フィルタリングオプション
   * @returns 検索用のURL
   */
  const buildSearchUrl = (params: SearchParams, options: FilterOptions): string => {
    const { keyword, page, excludeKeywords, status, sellerId, minPrice, maxPrice } = params;
    const { excludeMultipleBids, excludeJunk, excludeSets, excludeNew, excludeFreeShipping } = options;
    
    let searchKeyword = keyword;
    const excludeTerms = [...excludeKeywords];

    if (excludeMultipleBids) {
      excludeTerms.push('入札1');
    }

    if (excludeJunk) {
      excludeTerms.push('ジャンク', '現状品');
    }

    if (excludeSets) {
      excludeTerms.push('まとめ', 'セット');
    }

    if (excludeNew) {
      excludeTerms.push('新品', '未使用', '未開封');
    }

    if (excludeFreeShipping) {
      excludeTerms.push('送料無料', '送料込み');
    }

    return `https://revathis-api.vercel.app/api/aucfree?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&negative_keyword=${encodeURIComponent(excludeTerms.join(','))}&status=${encodeURIComponent(status)}&seller=${encodeURIComponent(sellerId)}&min=${encodeURIComponent(minPrice)}&max=${encodeURIComponent(maxPrice)}`;
  };

  /**
   * 検索を実行する関数
   * @param e - フォームイベント
   * @param filterOptions - フィルタリングオプション
   * @param newPage - 新しいページ番号（オプション）
   * @param resetFilters - フィルターをリセットする関数
   * @param resetSelectedItems - 選択アイテムをリセットする関数
   * @param resetSortOrder - ソート順をリセットする関数（オプション）
   */
  const handleSearch = async (
    e: React.FormEvent,
    filterOptions: FilterOptions,
    newPage?: number,
    resetFilters?: () => void,
    resetSelectedItems?: () => void,
    resetSortOrder?: () => void
  ) => {
    e?.preventDefault();
    if (!searchParams.keyword.trim()) return;

    const isNewSearch = !newPage;
    
    setIsLoading(true);
    setError(null);

    // 新しい検索時に全ての絞り込みをリセット
    if (isNewSearch) {
      resetFilters?.();
      setResults([]);
      setCurrentSearchKeyword(searchParams.keyword);
      resetSelectedItems?.();
      resetSortOrder?.(); // ソート順もリセット
    }

    const updatedParams = {
      ...searchParams,
      page: isNewSearch ? 1 : (newPage || 1),
      sellerId: isCompanyOnly ? 'myniw58319' : searchParams.sellerId,
    };
    setSearchParams(updatedParams);

    try {
      const response = await fetch(buildSearchUrl(updatedParams, filterOptions));
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

  /**
   * 次のページのデータを読み込む関数
   * ページネーションボタンで使用
   * @param filterOptions - フィルタリングオプション
   * @param showSelectedOnly - 選択アイテムのみ表示するかどうか
   */
  const loadMore = useCallback(async (filterOptions: FilterOptions, showSelectedOnly: boolean) => {
    if (isLoading || isLoadingMore || searchParams.page >= totalPages) return;
    
    // 無限スクロールによる自動ロード機能を停止
    // フィルターの状態に関わらず、ボタンクリックでのみ次のページを読み込む
    
    setIsLoadingMore(true);
    const nextPage = searchParams.page + 1;
    
    try {
      const updatedParams = {
        ...searchParams,
        page: nextPage,
        sellerId: isCompanyOnly ? 'myniw58319' : searchParams.sellerId,
      };
      
      const response = await fetch(buildSearchUrl(updatedParams, filterOptions));
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
  }, [searchParams, totalPages, isLoading, isLoadingMore, isCompanyOnly]);

  /**
   * 全ての検索条件をリセットする関数
   */
  const resetSearch = () => {
    setSearchParams({
      keyword: '',
      page: 1,
      excludeKeywords: [],
      status: '',
      sellerId: '',
      minPrice: '',
      maxPrice: '',
    });
    setIsCompanyOnly(false);
  };

  return {
    searchParams,
    setSearchParams,
    currentSearchKeyword,
    searchHistory,
    results,
    isLoading,
    isLoadingMore,
    totalPages,
    totalCount,
    error,
    isCompanyOnly,
    setIsCompanyOnly,
    getAuctionUrl,
    handleSearch,
    loadMore,
    resetSearch
  };
}; 