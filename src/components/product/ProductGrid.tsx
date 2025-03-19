import { AuctionItem } from '../../types/product';
import { ProductGridItem } from './ProductGridItem';

interface ProductGridProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  onItemSelect: (id: string, index: number, e: React.MouseEvent) => void;
}

/**
 * 商品グリッド表示コンポーネント
 * 商品をグリッドレイアウトで表示
 */
export const ProductGrid = ({ items, selectedItems, onItemSelect }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <ProductGridItem
          key={item.id}
          item={item}
          isSelected={selectedItems.has(item.id)}
          onSelect={(e) => onItemSelect(item.id, index, e)}
        />
      ))}
    </div>
  );
}; 