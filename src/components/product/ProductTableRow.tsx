import { Circle, CheckCircle2, ExternalLink } from 'lucide-react';
import { AuctionItem } from '../../types/product';

interface ProductTableRowProps {
  item: AuctionItem;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

/**
 * 商品テーブル行コンポーネント
 * テーブル表示の個別行
 */
export const ProductTableRow = ({ item, isSelected, onSelect }: ProductTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50 cursor-pointer">
      {/* 選択セル */}
      <td className="px-2 py-3">
        <button
          onClick={onSelect}
          className={`p-1 rounded-full transition-opacity duration-200 ${
            isSelected
              ? 'text-blue-500 opacity-100'
              : 'text-gray-400 border opacity-50 hover:opacity-100'
          }`}
        >
          {isSelected ? (
            <CheckCircle2 size={20} />
          ) : (
            <Circle size={20} />
          )}
        </button>
      </td>
      
      {/* 商品名セル */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-16 h-16 object-cover bg-white rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <a
              href={item.itemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {item.title}
            </a>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* 価格セル */}
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="text-sm font-medium text-blue-600">
          ¥{item.currentPrice.toLocaleString()}
        </div>
        {item.buyItNowPrice && (
          <div className="text-xs text-gray-500">
            即決: ¥{item.buyItNowPrice.toLocaleString()}
          </div>
        )}
      </td>
      
      {/* 入札数セル */}
      <td className="px-4 py-3 text-center whitespace-nowrap">
        <div className="text-sm text-gray-900">{item.bidCount}件</div>
      </td>
      
      {/* 終了日時セル */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-gray-900">{item.endTime}</div>
      </td>
      
      {/* リンクセル */}
      <td className="px-4 py-3 text-center">
        <a
          href={item.itemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700"
        >
          <ExternalLink size={12} />
          開く
        </a>
      </td>
    </tr>
  );
}; 