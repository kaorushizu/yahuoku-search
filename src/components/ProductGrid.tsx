import React from 'react';
import { AuctionItem, ProductTag } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  items: AuctionItem[];
  selectedItems: Set<string>;
  getAuctionUrl: (id: string) => string;
  getProductTags: (title: string) => ProductTag[];
  onSelectionToggle: (e: React.MouseEvent, id: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  items,
  selectedItems,
  getAuctionUrl,
  getProductTags,
  onSelectionToggle
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <ProductCard
          key={item.オークションID}
          item={item}
          isSelected={selectedItems.has(item.オークションID)}
          getAuctionUrl={getAuctionUrl}
          getProductTags={getProductTags}
          onSelectionToggle={onSelectionToggle}
        />
      ))}
    </div>
  );
};

export default ProductGrid; 