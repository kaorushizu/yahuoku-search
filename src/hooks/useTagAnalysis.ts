import { useMemo } from 'react';
import { AuctionItem, ProductTag, TagCount } from '../types';

interface UseTagAnalysisReturn {
  availableTags: TagCount[];
}

export const useTagAnalysis = (
  results: AuctionItem[],
  getProductTags: (title: string) => ProductTag[]
): UseTagAnalysisReturn => {
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    results.forEach(item => {
      const itemTags = getProductTags(item.商品名);
      itemTags.forEach(tag => {
        tagCounts.set(tag.keyword, (tagCounts.get(tag.keyword) || 0) + 1);
      });
    });

    return [...tagCounts.entries()]
      .map(([keyword, count]) => {
        const tag = getProductTags(keyword)[0]; // この方法は改善の余地あり
        return { tag, count };
      })
      .filter(item => item.tag && item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [results, getProductTags]);

  return { availableTags };
};

export default useTagAnalysis; 