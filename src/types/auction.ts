/**
 * オークション商品の情報を表す型
 * APIから取得した商品データの構造を定義
 */
export interface AuctionItem {
  オークションID: string;  // オークションの一意の識別子
  商品名: string;         // 商品のタイトル
  落札金額: number;       // 商品が落札された価格
  画像URL: string;        // 商品画像のURL
  入札数: number;         // 商品への入札回数
  終了日: string;         // オークションが終了した日時
}

/**
 * APIからのレスポンスデータの構造を定義
 * ページネーション情報と商品リストを含む
 */
export interface ApiResponse {
  page: number;           // 現在のページ番号
  page_total: number;     // 全体のページ数
  items: AuctionItem[];   // 商品データの配列
  total_count?: number;   // 検索結果の総件数（オプショナル）
}

/**
 * 商品に付与できるタグの型定義
 * 商品の状態や特徴を示すタグの構造を定義
 */
export interface ProductTag {
  keyword: string;             // タグのキーワード（検索用）
  label: string;               // タグの表示名
  color: string;               // タグの表示色（Tailwind CSSのクラス名）
  group: '状態' | 'ジャンク' | 'まとめ' | '送料';  // タグのカテゴリ分類
}

/**
 * タグの使用状況を表す型定義
 * 特定のタグが検索結果内で何回使用されているかを示す
 */
export interface TagCount {
  tag: ProductTag;             // タグの情報
  count: number;               // そのタグが付与されている商品数
} 