export interface AuctionItem {
  オークションID: string;
  商品名: string;
  現在価格: number;
  即決価格: number;
  入札数: number;
  残り時間: string;
  商品画像URL: string;
  商品URL: string;
  タグ: string[];
}

export interface SearchParams {
  keyword: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price-asc' | 'price-desc' | 'end-date-asc' | 'end-date-desc';
  tags: string[];
}

export interface LayoutType {
  type: 'grid' | 'table';
}

export interface FilteredResultsProps {
  results: AuctionItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string) => void;
  onShiftSelect: (startIndex: number, endIndex: number) => void;
  layout: LayoutType['type'];
}

export interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  tags: string[];
  onTagSelect: (tag: string) => void;
  selectedTags: string[];
}

// 各型定義ファイルからエクスポート
export * from './product';
export * from './search';
export * from './filter';
export * from './statistics';
export * from './ui'; 