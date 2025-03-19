import { Circle, CheckCircle2 } from 'lucide-react';
import { AuctionItem } from '../../types/product';

interface ProductGridItemProps {
  item: AuctionItem;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

/**
 * 商品グリッドアイテムコンポーネント
 * グリッド表示の個別アイテム
 */
export const ProductGridItem = ({ item, isSelected, onSelect }: ProductGridItemProps) => {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* 選択ボタン */}
      <button
        onClick={onSelect}
        className={`absolute top-2 right-2 z-10 p-1 rounded-full ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected ? (
          <CheckCircle2 size={20} />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* 商品リンク */}
      <a
        href={item.itemUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4"
      >
        {/* 商品画像 */}
        <div className="aspect-square mb-4">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
            }}
          />
        </div>

        {/* 商品情報 */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-600 font-medium">
            ¥{item.currentPrice.toLocaleString()}
          </span>
          <span className="text-gray-500">
            入札数: {item.bidCount}
          </span>
        </div>

        {/* タグ */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </a>
    </div>
  );
}; 