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

    // APIエンドポイントを開発環境用に変更
    return `http://localhost:3000/api/aucfree?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&negative_keyword=${encodeURIComponent(excludeTerms.join(','))}&status=${encodeURIComponent(status)}&seller=${encodeURIComponent(sellerId)}&min=${encodeURIComponent(minPrice)}&max=${encodeURIComponent(maxPrice)}`;
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
    
    // フォームイベントからキーワードと検索パラメータを直接取得できるか試みる
    let keywordFromForm = '';
    let searchParamsFromEvent = null;
    
    try {
      const formEvent = e as any;
      // キーワードを取得
      if (formEvent.target?.elements?.keyword?.value) {
        keywordFromForm = formEvent.target.elements.keyword.value.trim();
      }
      
      // イベントに検索パラメータが直接含まれている場合（URLからの検索時）
      if (formEvent.searchParams) {
        searchParamsFromEvent = formEvent.searchParams;
        console.log('イベントから検索パラメータを取得:', searchParamsFromEvent);
      }
    } catch (error) {
      console.error('フォームデータ取得エラー:', error);
    }
    
    // 検索に使用するパラメータ - イベントから取得したものを優先
    const paramsToUse = searchParamsFromEvent || searchParams;
    
    // フォームから取得したキーワードがある場合は優先、なければパラメータのキーワードを使用
    const effectiveKeyword = keywordFromForm || paramsToUse.keyword.trim();
    
    // 検索条件の判定：キーワードまたは他の検索条件（出品者ID、商品状態、価格範囲）が指定されている場合のみ検索
    const hasSearchCriteria = 
      effectiveKeyword !== '' || 
      paramsToUse.sellerId !== '' || 
      paramsToUse.status !== '' || 
      paramsToUse.minPrice !== '' || 
      paramsToUse.maxPrice !== '';
    
    if (!hasSearchCriteria) {
      return;
    }

    const isNewSearch = !newPage;
    
    setIsLoading(true);
    setError(null);

    // 新しい検索時に全ての絞り込みをリセット
    if (isNewSearch) {
      resetFilters?.();
      setResults([]);
      setCurrentSearchKeyword(effectiveKeyword);
      resetSelectedItems?.();
      resetSortOrder?.(); // ソート順もリセット
    }

    // 検索パラメータを更新
    const updatedParams = {
      ...paramsToUse,
      keyword: effectiveKeyword, // フォームから取得したキーワードを優先
      page: isNewSearch ? 1 : (newPage || 1),
      sellerId: isCompanyOnly ? 'myniw58319' : paramsToUse.sellerId,
    };
    setSearchParams(updatedParams);

    try {
      const searchUrl = buildSearchUrl(updatedParams, filterOptions);
      console.log('API URL:', searchUrl);
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) throw new Error('検索中にエラーが発生しました');
      
      const data: ApiResponse = await response.json();
      console.log('API検索結果:', { 
        現在ページ: data.current_page,
        総件数: data.items_total, 
        ページ数: data.page_total, 
        アイテム数: data.items.length 
      });
      
      if (isNewSearch) {
        setResults(data.items);
      } else {
        setResults(prev => [...prev, ...data.items]);
      }
      
      setTotalPages(data.page_total);
      setTotalCount(data.items_total || data.items.length * data.page_total);
      
      if (!searchHistory.includes(effectiveKeyword)) {
        setSearchHistory(prev => [effectiveKeyword, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      console.error('検索エラー:', err);
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
      setTotalCount(data.items_total || data.items.length * data.page_total);
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