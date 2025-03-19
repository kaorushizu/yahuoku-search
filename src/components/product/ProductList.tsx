import { Package2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AuctionItem, LayoutType, SortOrder } from '../../types/product';
import { LAYOUT_OPTIONS } from '../../constants/product';
import { ProductGrid } from './ProductGrid';
import { ProductTable } from './ProductTable';
import { EmptyState } from '../common/EmptyState';
import { LoadingIndicator } from '../common/LoadingIndicator';

interface ProductListProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string, index: number, e: React.MouseEvent) => void;
  onSelectAll?: () => void;
  layout: LayoutType;
  onLayoutChange?: (layout: LayoutType) => void;
  isLoading?: boolean;
  sortOrder?: SortOrder;
  onSortChange?: (sortOrder: SortOrder) => void;
}

/**
 * 商品リストコンポーネント
 * グリッドとテーブルの切り替え、並び替え機能を含む
 */
export const ProductList = ({ 
  items,
  selectedItems,
  onItemSelect,
  onSelectAll,
  layout,
  onLayoutChange,
  isLoading = false,
  sortOrder = 'none',
  onSortChange
}: ProductListProps) => {
  if (isLoading && items.length === 0) {
    return <LoadingIndicator />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="商品が見つかりませんでした"
        description="検索条件を変更して、もう一度お試しください"
      />
    );
  }

  const handleLayoutChange = (newLayout: LayoutType) => {
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  const handleSortChange = () => {
    if (!onSortChange) return;
    
    if (sortOrder === 'none') {
      onSortChange('price-asc');
    } else if (sortOrder === 'price-asc') {
      onSortChange('price-desc');
    } else {
      onSortChange('none');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white rounded-lg shadow p-3">
        <div className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{items.length.toLocaleString()}</span>
          <span className="mx-1">件表示</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Package2 size={16} />
            <span>{items.length.toLocaleString()}件</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* レイアウト切り替えボタン */}
            {onLayoutChange && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleLayoutChange(option.value)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                      layout === option.value
                        ? 'bg-white text-gray-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* 並び替えボタン */}
            {onSortChange && (
              <button
                onClick={handleSortChange}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                  sortOrder === 'none' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {sortOrder === 'price-asc' ? <ArrowUp size={14} /> : 
                 sortOrder === 'price-desc' ? <ArrowDown size={14} /> : 
                 <ArrowUpDown size={14} />}
                {sortOrder === 'none' ? '価格順' : 
                 sortOrder === 'price-asc' ? '価格: 安い順' : 
                 '価格: 高い順'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 商品リスト */}
      {layout === 'grid' ? (
        <ProductGrid
          items={items}
          selectedItems={selectedItems}
          onItemSelect={onItemSelect}
        />
      ) : (
        <ProductTable
          items={items}
          selectedItems={selectedItems}
          onItemSelect={onItemSelect}
          onSelectAll={onSelectAll}
        />
      )}
    </div>
  );
}; 