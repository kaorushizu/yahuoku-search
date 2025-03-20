/**
 * 検索時に使用するパラメータの型定義
 * 検索条件やフィルタリング条件を含む
 */
export interface SearchParams {
  keyword: string;           // メインの検索キーワード
  page: number;             // ページ番号
  excludeKeywords: string[]; // 除外キーワードのリスト
  status: string;           // 商品の状態
  sellerId: string;         // 出品者ID
  minPrice: string;         // 最低価格
  maxPrice: string;         // 最高価格
}

/**
 * 検索結果に対する詳細なフィルタリングオプションの型定義
 * 商品の状態や特徴に基づくフィルタリング条件を管理
 */
export interface FilterOptions {
  selectedTags: string[];        // 選択された商品タグのリスト
  excludeMultipleBids: boolean;  // 入札数が1回の商品を除外するかどうか
  excludeJunk: boolean;         // ジャンク品を除外するかどうか
  excludeKeywords: string[];    // 除外するキーワードのリスト
  excludeSets: boolean;         // セット商品を除外するかどうか
  excludeNew: boolean;          // 新品商品を除外するかどうか
  filterKeywords: string[];     // 含むべきキーワードのリスト
  excludeFreeShipping: boolean;  // 送料無料の商品を除外するかどうか
}

/**
 * 価格によるソート順を表す型
 * none: ソートなし
 * asc: 昇順（安い順）
 * desc: 降順（高い順）
 */
export type SortOrder = 'none' | 'asc' | 'desc'; 