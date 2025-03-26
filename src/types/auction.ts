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
  current_page: number;     // 現在のページ番号
  page_total: number;       // 全体のページ数
  items: AuctionItem[];     // 商品データの配列
  items_total: number;      // 検索結果の総件数
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

/**
 * 商品詳細APIのレスポンス型
 * 商品の詳細情報を含む
 */
export interface ProductDetailResponse {
  auctionId: string;           // オークションID
  title: string;               // 商品タイトル
  keyword: string | null;      // 検索キーワード
  quantity: number;            // 数量
  biddersNum: number;          // 入札者数
  watchListNum: number;        // ウォッチリスト数
  price: number;               // 価格
  startPrice: number;          // 開始価格
  bidCount: number;            // 入札数
  condition: string;           // 商品状態
  endDate: string;             // 終了日時
  endDateUnix: number;         // 終了日時(UNIX時間)
  images: string[];            // 商品画像URL配列
  description: string;         // 商品説明
  categories: {                // カテゴリー情報
    name: string;              // カテゴリー名
    id: string;                // カテゴリーID
  }[];
  brands: any | null;          // ブランド情報
  seller: any | null;          // 出品者情報
  shipping: any | null;        // 配送情報
  tax: any | null;             // 税情報
  url: string;                 // 商品URL
} 