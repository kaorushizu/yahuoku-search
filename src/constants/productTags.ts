import { ProductTag } from '../types';

export const PRODUCT_TAGS: ProductTag[] = [
  // 状態関連
  { keyword: '新品', label: '新品', color: 'bg-green-600/90 text-white', group: '状態' },
  { keyword: '未開封', label: '未開封', color: 'bg-teal-600/90 text-white', group: '状態' },
  { keyword: '未使用', label: '未使用', color: 'bg-emerald-600/90 text-white', group: '状態' },
  { keyword: '美品', label: '美品', color: 'bg-blue-600/90 text-white', group: '状態' },

  // ジャンク関連
  { keyword: 'ジャンク', label: 'ジャンク', color: 'bg-red-600/90 text-white', group: 'ジャンク' },
  { keyword: '現状', label: '現状品', color: 'bg-orange-600/90 text-white', group: 'ジャンク' },
  { keyword: '訳あり', label: '訳あり', color: 'bg-amber-600/90 text-white', group: 'ジャンク' },

  // まとめ関連
  { keyword: 'まとめ', label: 'まとめ', color: 'bg-indigo-600/90 text-white', group: 'まとめ' },
  { keyword: 'セット', label: 'セット', color: 'bg-violet-600/90 text-white', group: 'まとめ' },

  // 送料関連
  { keyword: '送料無料', label: '送料無料', color: 'bg-purple-600/90 text-white', group: '送料' },
  { keyword: '送料込', label: '送料込み', color: 'bg-fuchsia-600/90 text-white', group: '送料' },
];

export const getProductTags = (title: string): ProductTag[] => {
  return PRODUCT_TAGS.filter(tag => title.includes(tag.keyword));
};

export default PRODUCT_TAGS; 