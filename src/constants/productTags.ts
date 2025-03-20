import { ProductTag } from '../types';

/**
 * アプリケーションで使用する全てのタグの定義
 * 商品の状態、ジャンク品、セット商品、送料に関する情報を分類して管理
 */
export const PRODUCT_TAGS: ProductTag[] = [
  // 商品の状態を示すタグ（新品・未使用など）
  { keyword: '新品', label: '新品', color: 'bg-green-600/90 text-white', group: '状態' },
  { keyword: '未開封', label: '未開封', color: 'bg-teal-600/90 text-white', group: '状態' },
  { keyword: '未使用', label: '未使用', color: 'bg-emerald-600/90 text-white', group: '状態' },
  { keyword: '美品', label: '美品', color: 'bg-blue-600/90 text-white', group: '状態' },

  // 商品の問題点を示すタグ（ジャンク品など）
  { keyword: 'ジャンク', label: 'ジャンク', color: 'bg-red-600/90 text-white', group: 'ジャンク' },
  { keyword: '現状', label: '現状品', color: 'bg-orange-600/90 text-white', group: 'ジャンク' },
  { keyword: '訳あり', label: '訳あり', color: 'bg-amber-600/90 text-white', group: 'ジャンク' },

  // 商品のセット販売を示すタグ
  { keyword: 'まとめ', label: 'まとめ', color: 'bg-indigo-600/90 text-white', group: 'まとめ' },
  { keyword: 'セット', label: 'セット', color: 'bg-violet-600/90 text-white', group: 'まとめ' },

  // 送料に関する情報を示すタグ
  { keyword: '送料無料', label: '送料無料', color: 'bg-purple-600/90 text-white', group: '送料' },
  { keyword: '送料込', label: '送料込み', color: 'bg-fuchsia-600/90 text-white', group: '送料' },
]; 