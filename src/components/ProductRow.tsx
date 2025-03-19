import React from 'react';
import { Circle, CheckCircle2, ExternalLink } from 'lucide-react';
import { AuctionItem, ProductTag } from '../types';

interface ProductRowProps {
  item: AuctionItem;
  isSelected: boolean;
  getAuctionUrl: (id: string) => string;
  getProductTags: (title: string) => ProductTag[];
  onSelectionToggle: (e: React.MouseEvent, id: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  item,
  isSelected,
  getAuctionUrl,
  getProductTags,
  onSelectionToggle
}) => {
  return (
    <tr className="group hover:bg-gray-50">
      <td className="px-2 py-3">
        <button
          onClick={(e) => onSelectionToggle(e, item.オークションID)}
          className={`p-1 rounded-full transition-colors duration-200 ${
            isSelected
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-400 border'
          }`}
        >
          {isSelected ? (
            <CheckCircle2 size={16} />
          ) : (
            <Circle size={16} />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3 items-center">
          <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
            <img
              src={item.画像URL}
              alt={item.商品名}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-gray-900 font-medium truncate hover:text-clip mb-1">
              {item.商品名}
            </div>
            <div className="flex flex-wrap gap-1">
              {getProductTags(item.商品名).map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${tag.color}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="text-sm font-bold text-gray-900">¥{item.落札金額.toLocaleString()}</div>
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        <div className="text-sm text-gray-600">{item.入札数}件</div>
      </td>
      <td className="px-4 py-3 text-left whitespace-nowrap">
        <div className="text-sm text-gray-600">{item.終了日}</div>
      </td>
      <td className="px-4 py-3 text-center">
        <a
          href={getAuctionUrl(item.オークションID)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-500"
        >
          <ExternalLink size={16} />
        </a>
      </td>
    </tr>
  );
};

export default ProductRow; 