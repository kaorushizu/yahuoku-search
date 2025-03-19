import { ProductTag, ProductTagGroup } from '../types/product';

/**
 * 商品タグ定義
 */
export const PRODUCT_TAGS: ProductTag[] = [
  // 状態関連
  { key: '新品', label: '新品', colorClass: 'bg-green-600/90 text-white', group: '状態' },
  { key: '未開封', label: '未開封', colorClass: 'bg-teal-600/90 text-white', group: '状態' },
  { key: '未使用', label: '未使用', colorClass: 'bg-emerald-600/90 text-white', group: '状態' },
  // ジャンク関連
  { key: 'ジャンク', label: 'ジャンク', colorClass: 'bg-red-600/90 text-white', group: 'ジャンク' },
  { key: '現状品', label: '現状品', colorClass: 'bg-orange-600/90 text-white', group: 'ジャンク' },
  // まとめ関連
  { key: 'まとめ', label: 'まとめ', colorClass: 'bg-blue-600/90 text-white', group: 'まとめ' },
  { key: 'セット', label: 'セット', colorClass: 'bg-indigo-600/90 text-white', group: 'まとめ' },
  // 送料関連
  { key: '送料無料', label: '送料無料', colorClass: 'bg-purple-600/90 text-white', group: '送料' },
];

/**
 * レイアウトオプション
 */
export const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'グリッド表示' },
  { value: 'table', label: 'テーブル表示' },
] as const;

/**
 * テーブルカラム定義
 */
export const TABLE_COLUMNS = [
  { key: '商品名', className: 'w-1/3' },
  { key: '現在価格', className: 'w-1/6' },
  { key: '入札数', className: 'w-1/6' },
  { key: '終了日時', className: 'w-1/6' },
] as const; 