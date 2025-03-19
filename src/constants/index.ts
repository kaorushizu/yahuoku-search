export const SORT_OPTIONS = [
  { value: 'price-asc', label: '価格の安い順' },
  { value: 'price-desc', label: '価格の高い順' },
  { value: 'end-date-asc', label: '終了間近順' },
  { value: 'end-date-desc', label: '終了日時順' },
] as const;

export const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'グリッド表示' },
  { value: 'table', label: 'テーブル表示' },
] as const;

export const PRICE_RANGE = {
  MIN: 0,
  MAX: 1000000,
  STEP: 1000,
} as const;

export const API_ENDPOINTS = {
  SEARCH: '/api/search',
  TAGS: '/api/tags',
} as const;

export const TABLE_COLUMNS = [
  { key: '商品名', className: 'w-1/3' },
  { key: '現在価格', className: 'w-1/6' },
  { key: '入札数', className: 'w-1/6' },
  { key: '終了日時', className: 'w-1/6' },
] as const;

// 各定数ファイルからエクスポート
export * from './api';
export * from './product';
export * from './search';
export * from './ui'; 