import { useState, useCallback } from 'react';
import { SearchParams, AuctionItem, ApiResponse } from '../types';

interface UseAuctionSearchReturn {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  updateSearchParams: (params: Partial<SearchParams>) => void;
  currentSearchKeyword: string;
  setCurrentSearchKeyword: (keyword: string) => void;
  searchHistory: string[];
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
  results: AuctionItem[];
  setResults: React.Dispatch<React.SetStateAction<AuctionItem[]>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isLoadingMore: boolean;
  setIsLoadingMore: (loading: boolean) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  totalCount: number;
  setTotalCount: (count: number) => void;
  error: string | null;
  setError: (error: string | null) => void;
  handleSearch: (e: React.FormEvent, newPage?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  isCompanyOnly: boolean;
  setIsCompanyOnly: (isCompany: boolean) => void;
}

export const useAuctionSearch = (): UseAuctionSearchReturn => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: '',
    page: 1,
    negative_keyword: '',
    status: '',
    seller: '',
    min: '',
    max: '',
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

  const buildSearchUrl = (params: SearchParams) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.append(key, value.toString());
      }
    });
    return `https://revathis-api.vercel.app/api/aucfree?${urlParams.toString()}`;
  };

  const updateSearchParams = useCallback((params: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent, newPage?: number) => {
    e?.preventDefault();
    if (!searchParams.keyword.trim()) return;

    const isNewSearch = !newPage;
    
    setIsLoading(true);
    setError(null);

    if (isNewSearch) {
      setResults([]);
      setCurrentSearchKeyword(searchParams.keyword);
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
  }, [searchParams, searchHistory, isCompanyOnly]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || searchParams.page >= totalPages) return;
    
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
  }, [searchParams, totalPages, isLoading, isLoadingMore, isCompanyOnly]);

  return {
    searchParams,
    setSearchParams,
    updateSearchParams,
    currentSearchKeyword,
    setCurrentSearchKeyword,
    searchHistory,
    setSearchHistory,
    results,
    setResults,
    isLoading,
    setIsLoading,
    isLoadingMore,
    setIsLoadingMore,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    error,
    setError,
    handleSearch,
    loadMore,
    isCompanyOnly,
    setIsCompanyOnly
  };
};

export default useAuctionSearch; 