/**
 * 検索のソートオプション
 */
export const SORT_OPTIONS = [
  { value: 'price-asc', label: '価格の安い順' },
  { value: 'price-desc', label: '価格の高い順' },
  { value: 'end-date-asc', label: '終了間近順' },
  { value: 'end-date-desc', label: '終了日時順' },
] as const;

/**
 * 価格範囲設定
 */
export const PRICE_RANGE = {
  MIN: 0,
  MAX: 1000000,
  STEP: 1000,
} as const; 