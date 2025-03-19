import { AuctionItem } from './product';
import { SortOrder } from './product';

/**
 * 検索パラメータのインターフェース
 */
export interface SearchParams {
  keyword: string;             // 検索キーワード
  page?: number;               // ページ番号（オプショナル）
  minPrice?: number;           // 最小価格（オプショナル）
  maxPrice?: number;           // 最大価格（オプショナル）
  sortBy?: SortOrder;          // 並び順（オプショナル）
  excludeKeywords?: string[];  // 除外キーワード（オプショナル）
  status?: string;             // 商品の状態（オプショナル）
  seller?: string;             // 出品者ID（オプショナル）
  tags?: string[];             // 含めるタグ（オプショナル）
}

/**
 * API応答のインターフェース
 */
export interface ApiResponse {
  items: AuctionItem[];        // 商品リスト
  page: number;                // 現在のページ番号
  pageTotal: number;           // 総ページ数
  totalCount?: number;         // 総アイテム数（オプショナル）
} 