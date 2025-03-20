import { useMemo } from 'react';
import { AuctionItem, Statistics, PriceRange } from '../types';

/**
 * 統計情報を計算するためのカスタムフック
 * 
 * @param items - 統計を計算する商品の配列
 * @returns 統計情報または計算不能の場合はnull
 */
export const useStatistics = (items: AuctionItem[]) => {
  /**
   * 統計情報を計算する関数
   * @param items - 商品データの配列
   * @returns 統計情報オブジェクト
   */
  const calculateStatistics = (items: AuctionItem[]): Statistics | null => {
    if (items.length === 0) return null;

    const prices = items.map(item => item.落札金額);
    const sum = prices.reduce((a, b) => a + b, 0);
    const sorted = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // ボリュームゾーンのための閾値を設定
    // このアプローチでは、閾値以上の価格はすべて「閾値以上」としてまとめられます
    // 閾値は以下の方法で計算することができます（いずれかを選択または調整）
    
    // 方法1: 75パーセンタイル値を使用（全データの75%をカバーする価格）
    const percentile75Index = Math.floor(sorted.length * 0.75);
    const percentile75Value = sorted[percentile75Index];
    
    // 方法2: 中央値の3倍を使用（より保守的な閾値）
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
    const medianThreshold = median * 3;
    
    // ここでは方法1と方法2の小さい方を採用（よりボリュームゾーンを拡大）
    // 閾値パラメータ - ここを調整することでグラフの表示範囲が変わります
    const threshold = Math.min(percentile75Value * 1.5, medianThreshold);
    
    // 通常のビン数（閾値以下の範囲を何分割するか）
    const numBins = 9;
    
    // 閾値以下の範囲を均等に分割
    const step = threshold / numBins;

    // 通常の価格範囲ビンを作成（閾値以下）
    const priceRanges = Array.from({ length: numBins }, (_, i) => {
      const rangeStart = step * i;
      const rangeEnd = step * (i + 1);
      
      // 価格表示を簡略化（単位をK（千円）に変換して表示）
      const formattedStart = formatPriceForLabel(rangeStart);
      const formattedEnd = formatPriceForLabel(rangeEnd);
      
      return {
        range: `${formattedStart}~${formattedEnd}`,
        count: 0,
        rangeStart,
        rangeEnd
      };
    });
    
    // 「閾値以上」のビンを追加
    priceRanges.push({
      range: `${formatPriceForLabel(threshold)}~`,
      count: 0,
      rangeStart: threshold,
      rangeEnd: Number.MAX_SAFE_INTEGER // 無限大として扱う
    });

    // 各価格を適切なビンに割り当て
    prices.forEach(price => {
      // 閾値以上の場合、最後のビンに割り当て
      if (price >= threshold) {
        priceRanges[priceRanges.length - 1].count++;
        return;
      }
      
      // 閾値未満の場合、適切なビンを探す
      for (let i = 0; i < numBins; i++) {
        const range = priceRanges[i];
        if (price >= range.rangeStart && price < range.rangeEnd) {
          priceRanges[i].count++;
          break;
        }
      }
    });

    return {
      median,
      average: sum / prices.length,
      max,
      min,
      priceRanges
    };
  };

  /**
   * 価格ラベル用に金額を見やすく整形する関数
   * シンプルに¥マークと数値だけで表示
   */
  const formatPriceForLabel = (price: number): string => {
    // 整数に丸めてからカンマ区切りで表示
    return `¥${Math.round(price).toLocaleString()}`;
  };

  // 統計情報の計算
  const statistics = useMemo(() => calculateStatistics(items), [items]);

  return statistics;
};