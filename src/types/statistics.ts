/**
 * 統計情報のインターフェース
 */
export interface Statistics {
  median: number;                         // 中央値
  average: number;                        // 平均値
  max: number;                            // 最高値
  min: number;                            // 最安値
  priceRanges: PriceRangeStatistics[];    // 価格帯ごとの統計
}

/**
 * 価格帯ごとの統計情報
 */
export interface PriceRangeStatistics {
  range: string;        // 表示用の価格帯
  count: number;        // 件数
  rangeStart?: number;  // 価格帯の開始（内部計算用、オプショナル）
  rangeEnd?: number;    // 価格帯の終了（内部計算用、オプショナル）
} 