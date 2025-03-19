import React from 'react';
import { Circle, CheckCircle2, Calendar } from 'lucide-react';
import { AuctionItem, ProductTag } from '../types';

interface ProductCardProps {
  item: AuctionItem;
  isSelected: boolean;
  getAuctionUrl: (id: string) => string;
  getProductTags: (title: string) => ProductTag[];
  onSelectionToggle: (e: React.MouseEvent, id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isSelected,
  getAuctionUrl,
  getProductTags,
  onSelectionToggle
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group">
      <button
        onClick={(e) => onSelectionToggle(e, item.オークションID)}
        className={`absolute top-2 right-2 z-10 p-1 rounded-full ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
      >
        {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      <a
        href={getAuctionUrl(item.オークションID)}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="aspect-square relative">
          <img
            src={item.画像URL}
            alt={item.商品名}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
            }}
          />
          <div className="absolute top-0 left-0 p-2 flex flex-wrap gap-1 max-w-[calc(100%-48px)]">
            {getProductTags(item.商品名).map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tag.color} shadow-sm backdrop-blur-[2px]`}
              >
                {tag.label}
              </span>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 px-2 py-1 m-2 rounded bg-black/60 backdrop-blur-[2px]">
            <div className="flex items-center gap-2">
              <div className="text-white text-lg font-bold drop-shadow">¥{item.落札金額.toLocaleString()}</div>
              <div className="text-white text-xs font-medium">{item.入札数}件</div>
            </div>
          </div>
        </div>
        <div className="p-2">
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
              {item.商品名}
            </h3>
            <div className="flex items-center text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{item.終了日}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default ProductCard; 