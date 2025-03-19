/**
 * 商品（オークションアイテム）の統一インターフェース
 */
export interface AuctionItem {
  id: string;                // オークションID
  title: string;             // 商品名
  currentPrice: number;      // 現在価格
  buyItNowPrice?: number;    // 即決価格（オプショナル）
  bidCount: number;          // 入札数
  endTime: string;           // 残り時間/終了日時
  imageUrl: string;          // 商品画像URL
  itemUrl: string;           // 商品URL
  tags: string[];            // タグ
}

/**
 * 商品タグの定義
 */
export interface ProductTag {
  key: string;               // タグのキー
  label: string;             // 表示ラベル
  colorClass: string;        // 適用するCSSクラス
  group: ProductTagGroup;    // タグのグループ
}

/**
 * タグのグループ定義
 */
export type ProductTagGroup = '状態' | 'ジャンク' | 'まとめ' | '送料';

/**
 * 商品表示のレイアウトタイプ
 */
export type LayoutType = 'grid' | 'table';

/**
 * 並び順の定義
 */
export type SortOrder = 'none' | 'price-asc' | 'price-desc' | 'end-date-asc' | 'end-date-desc'; 