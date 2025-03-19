import { useState } from 'react';
import { Tag, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { AuctionItem, ProductTag } from '../../types/product';
import { PRODUCT_TAGS } from '../../constants/product';

interface TagFilterProps {
  results: AuctionItem[];
  selectedTags: Set<string>;
  onTagToggle: (tag: string) => void;
}

/**
 * タグによるフィルタリングコンポーネント
 */
export const TagFilter = ({ results, selectedTags, onTagToggle }: TagFilterProps) => {
  const [showTags, setShowTags] = useState(true);

  // 利用可能なタグと件数を計算
  const getAvailableTags = () => {
    const tagCounts = new Map<string, number>();
    
    results.forEach(item => {
      // アイテムに含まれるタグを検出
      const itemTags = PRODUCT_TAGS.filter(tag => item.title.includes(tag.key));
      itemTags.forEach(tag => {
        tagCounts.set(tag.key, (tagCounts.get(tag.key) || 0) + 1);
      });
    });
    
    return PRODUCT_TAGS
      .map(tag => ({
        tag,
        count: tagCounts.get(tag.key) || 0
      }))
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  };

  const availableTags = getAvailableTags();
  
  if (availableTags.length === 0) {
    return null;
  }

  // タグをグループ別に整理
  const tagGroups = (['状態', 'ジャンク', 'まとめ', '送料'] as const).map(group => {
    const groupTags = availableTags.filter(({ tag }) => tag.group === group);
    return { group, tags: groupTags };
  }).filter(group => group.tags.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Tag size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">タグで絞り込み</span>
        </div>
        <button
          onClick={() => setShowTags(!showTags)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showTags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showTags && (
        <div className="space-y-4">
          {tagGroups.map(({ group, tags }) => (
            <div key={group} className="bg-gray-100 rounded-md p-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">{group}</div>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map(({ tag, count }) => (
                  <button
                    key={tag.key}
                    onClick={() => onTagToggle(tag.key)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedTags.has(tag.key)
                        ? `${tag.colorClass} shadow-sm`
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {selectedTags.has(tag.key) && (
                      <CheckCircle2 size={12} className="flex-shrink-0" />
                    )}
                    <span className="font-medium">{tag.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium ${
                      selectedTags.has(tag.key) 
                        ? 'bg-white/80 text-gray-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 