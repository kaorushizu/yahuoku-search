export interface AuctionItem {
  オークションID: string;
  商品名: string;
  落札金額: number;
  画像URL: string;
  入札数: number;
  終了日: string;
}

export interface ApiResponse {
  page: number;
  page_total: number;
  items: AuctionItem[];
  total_count?: number;
}

export interface SearchParams {
  keyword: string;
  page: number;
  negative_keyword: string;
  status: string;
  seller: string;
  min: string;
  max: string;
}

export interface FilterOptions {
  selectedTags: string[];
  excludeMultipleBids: boolean;
  excludeJunk: boolean;
  excludeKeywords: string[];
  excludeSets: boolean;
  excludeNew: boolean;
  filterKeywords: string[];
}

export interface Statistics {
  median: number;
  average: number;
  max: number;
  min: number;
  priceRanges: { range: string; count: number }[];
}

export interface ProductTag {
  keyword: string;
  label: string;
  color: string;
  group: '状態' | 'ジャンク' | 'まとめ' | '送料';
}

export interface TagCount {
  tag: ProductTag;
  count: number;
}

export type SortOrder = 'none' | 'asc' | 'desc';
export type LayoutType = 'grid' | 'table'; 