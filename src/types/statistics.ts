/**
 * 検索結果の統計情報を表す型定義
 * 価格の分布や代表値を含む
 */
export interface Statistics {
  median: number;               // 価格の中央値
  average: number;              // 価格の平均値
  max: number;                  // 最高価格
  min: number;                  // 最低価格
  priceRanges: PriceRange[];    // 価格帯ごとの分布データ
}

/**
 * 価格帯ごとの分布データを表す型定義
 */
export interface PriceRange {
  range: string;                // 価格帯の表示用文字列
  count: number;                // その価格帯に含まれる商品数
} 