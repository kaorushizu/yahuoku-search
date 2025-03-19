import { ReactNode } from 'react';
import { AuctionItem, LayoutType } from './product';
import { SearchParams } from './search';
import { FilterOptions } from './filter';

/**
 * 検索フォームコンポーネントのProps
 */
export interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  tags: string[];
  onTagSelect: (tag: string) => void;
  selectedTags: string[];
}

/**
 * 商品リストコンポーネントのProps
 */
export interface ProductListProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string) => void;
  onShiftSelect: (startIndex: number, endIndex: number) => void;
  layout: LayoutType;
  onLayoutChange?: (layout: LayoutType) => void;
  onSelectAll?: () => void;
}

/**
 * フィルタパネルコンポーネントのProps
 */
export interface FilterPanelProps {
  results: AuctionItem[];
  filterOptions: FilterOptions;
  onChange: (options: FilterOptions) => void;
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
}

/**
 * 統計情報パネルコンポーネントのProps
 */
export interface StatisticsPanelProps {
  items: AuctionItem[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

/**
 * ツールチップコンポーネントのProps
 */
export interface TooltipProps {
  text: string;
  children: ReactNode;
} 