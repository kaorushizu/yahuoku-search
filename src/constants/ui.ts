/**
 * 表示件数オプション
 */
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 20, label: '20件' },
  { value: 50, label: '50件' },
  { value: 100, label: '100件' },
] as const;

/**
 * ローカルストレージキー
 */
export const STORAGE_KEYS = {
  LAYOUT: 'yahuoku-search-layout',
  SEARCH_HISTORY: 'yahuoku-search-history',
  UI_SETTINGS: 'yahuoku-search-ui-settings',
} as const; 