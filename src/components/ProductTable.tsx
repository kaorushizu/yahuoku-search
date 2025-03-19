import React from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';
import { AuctionItem, ProductTag } from '../types';
import ProductRow from './ProductRow';

interface ProductTableProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  getAuctionUrl: (id: string) => string;
  getProductTags: (title: string) => ProductTag[];
  onSelectionToggle: (e: React.MouseEvent, id: string) => void;
  onSelectAll: () => void;
  areAllSelected: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  items,
  selectedItems,
  getAuctionUrl,
  getProductTags,
  onSelectionToggle,
  onSelectAll,
  areAllSelected
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-8">
                <button
                  onClick={onSelectAll}
                  className={`p-1 rounded-full transition-opacity duration-200 ${
                    areAllSelected
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-400 border'
                  }`}
                >
                  {areAllSelected ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">商品名</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">現在価格</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">入札数</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">終了日時</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <ProductRow
                key={item.オークションID}
                item={item}
                isSelected={selectedItems.has(item.オークションID)}
                getAuctionUrl={getAuctionUrl}
                getProductTags={getProductTags}
                onSelectionToggle={onSelectionToggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable; 