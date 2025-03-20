import { useMemo } from 'react';
import { AuctionItem, Statistics } from '../types';

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
    const range = max - min;
    const step = range / 10;

    const priceRanges = Array.from({ length: 10 }, (_, i) => {
      const rangeStart = min + (step * i);
      const rangeEnd = min + (step * (i + 1));
      return {
        range: `¥${Math.round(rangeStart).toLocaleString()} ~ ¥${Math.round(rangeEnd).toLocaleString()}`,
        count: 0,
        rangeStart,
        rangeEnd
      };
    });

    prices.forEach(price => {
      const rangeIndex = priceRanges.findIndex(range => 
        price >= range.rangeStart && price < range.rangeEnd
      );
      if (rangeIndex >= 0) {
        priceRanges[rangeIndex].count++;
      }
    });

    return {
      median: sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle],
      average: sum / prices.length,
      max,
      min,
      priceRanges: priceRanges.map(({ range, count }) => ({ range, count }))
    };
  };

  // 統計情報の計算
  const statistics = useMemo(() => calculateStatistics(items), [items]);

  return statistics;
}; 