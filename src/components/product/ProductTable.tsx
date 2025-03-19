import { Circle, CheckCircle2 } from 'lucide-react';
import { AuctionItem } from '../../types/product';
import { ProductTableRow } from './ProductTableRow';
import { TABLE_COLUMNS } from '../../constants/product';

interface ProductTableProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string, index: number, e: React.MouseEvent) => void;
  onSelectAll?: () => void;
}

/**
 * 商品テーブル表示コンポーネント
 * 商品をテーブルレイアウトで表示
 */
export const ProductTable = ({ 
  items, 
  selectedItems, 
  onItemSelect,
  onSelectAll
}: ProductTableProps) => {
  const isAllSelected = items.length > 0 && items.every(item => selectedItems.has(item.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8 px-2">
              {onSelectAll && (
                <button
                  onClick={onSelectAll}
                  className={`p-1 rounded-full transition-opacity duration-200 ${
                    isAllSelected
                      ? 'text-blue-500'
                      : 'text-gray-400 border'
                  }`}
                >
                  {isAllSelected ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Circle size={16} />
                  )}
                </button>
              )}
            </th>
            {TABLE_COLUMNS.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className}`}
              >
                {column.key}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
              リンク
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <ProductTableRow
              key={item.id}
              item={item}
              isSelected={selectedItems.has(item.id)}
              onSelect={(e) => onItemSelect(item.id, index, e)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}; 