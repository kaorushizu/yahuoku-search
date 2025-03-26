import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, Circle, Package2, ArrowUpDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import ImageMagnifier from '../common/ImageMagnifier';
import { AuctionItem, ProductTag, SortOrder } from '../../types';
import ProductDrawer from '../common/ProductDrawer';
import { useProductDetail } from '../../hooks';
import { useSearch } from '../../contexts/SearchContext';

// 価格表示用のメモ化コンポーネント
const PriceDisplay = React.memo(({ price, bidCount }: { price: number, bidCount: number }) => (
  <div className="flex items-center gap-2">
    <div className="text-white text-lg font-bold drop-shadow">¥{price.toLocaleString()}</div>
    <div className="text-white text-xs font-medium">{bidCount}件</div>
  </div>
));

// テーブルビュー用価格表示コンポーネント
const TablePriceDisplay = React.memo(({ price }: { price: number }) => (
  <div className="text-sm font-semibold text-gray-900">
    ¥{price.toLocaleString()}
  </div>
));

// テーブルビュー用入札数表示コンポーネント
const BidCountDisplay = React.memo(({ count }: { count: number }) => (
  <div className="text-sm text-gray-900">{count}件</div>
));

interface ResultsListProps {
  filteredResults: AuctionItem[];
  layout: 'grid' | 'table';
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  selectedItems: Set<string>;
  toggleItemSelection: (id: string) => void;
  handleRangeSelection: (id: string) => void;
  getProductTags: (title: string) => ProductTag[];
  getAuctionUrl: (id: string, endDate: string) => string;
  setLayout: React.Dispatch<React.SetStateAction<'grid' | 'table'>>;
  toggleSelectAll: () => void;
  statistics: {
    medianPrice: number;
  } | null;
  showSelectedOnly: boolean;
  hideSelectedItems: boolean;
  totalCount: number;
  results: AuctionItem[];
}

// No Image画像のURLを定数として定義
const NO_IMAGE_URL = 'https://placehold.jp/bdbdc2/ffffff/400x400.png?text=No%20Image';

// 落札日からの経過年数を取得する関数
const getYearsSinceAuction = (endDate: string): number => {
  if (!endDate) return 0;
  
  // 日付フォーマットが「2023年10月08日」の場合
  const datePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
  const match = endDate.match(datePattern);
  
  if (match) {
    const [_, year, month, day] = match;
    const auctionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const now = new Date();
    
    // 経過年数を計算
    const diffTime = now.getTime() - auctionDate.getTime();
    const diffYears = diffTime / (1000 * 3600 * 24 * 365.25);
    
    return diffYears;
  }
  
  return 0;
};

// 経過年数に基づいてタグ情報を取得する関数
const getAgeTag = (endDate: string): ProductTag | null => {
  const years = getYearsSinceAuction(endDate);
  
  if (years >= 9) {
    return {
      keyword: 'age_9plus',
      label: '9年経過',
      color: 'bg-red-500 text-white',
      group: '状態' as const
    };
  } else if (years >= 7) {
    return {
      keyword: 'age_7plus',
      label: '7年経過',
      color: 'bg-orange-500 text-white',
      group: '状態' as const
    };
  } else if (years >= 5) {
    return {
      keyword: 'age_5plus',
      label: '5年経過',
      color: 'bg-yellow-400 text-gray-800',
      group: '状態' as const
    };
  } else if (years >= 3) {
    return {
      keyword: 'age_3plus',
      label: '3年経過',
      color: 'bg-yellow-200 text-gray-800',
      group: '状態' as const
    };
  } else if (years >= 1) {
    return {
      keyword: 'age_1plus',
      label: '1年経過',
      color: 'bg-gray-300 text-gray-800',
      group: '状態' as const
    };
  }
  
  return null;
};

/**
 * 検索結果リストコンポーネント
 * グリッドビューとテーブルビューの両方をサポートします
 */
const ResultsList: React.FC<ResultsListProps> = ({
  filteredResults,
  layout,
  sortOrder,
  setSortOrder,
  selectedItems,
  toggleItemSelection,
  handleRangeSelection,
  getProductTags,
  getAuctionUrl,
  setLayout,
  toggleSelectAll,
  statistics,
  showSelectedOnly,
  hideSelectedItems,
  totalCount,
  results
}) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AuctionItem | null>(null);
  
  // SearchContextから検索パラメータと現在の検索キーワードを取得
  const { searchParams, currentSearchKeyword } = useSearch();
  
  // 商品詳細APIフック
  const { isLoading, error, productDetail, fetchProductDetail, clearProductDetail } = useProductDetail();

  // ツールチップ関連のハンドラ（useCallbackで最適化）
  const handleMouseEnter = React.useCallback((content: string, e: React.MouseEvent) => {
    if (!content) return;
    setTooltipContent(content);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY + 25 });
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setTooltipContent(null);
  }, []);

  // 商品クリック時のハンドラ（useCallbackで最適化）
  const handleProductClick = React.useCallback(async (product: AuctionItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProduct(product);
    setIsDrawerOpen(true);
    
    // ドロワーを開くと同時に商品詳細APIを呼び出す
    if (product.オークションID) {
      await fetchProductDetail(product.オークションID, product.終了日 || '');
    }
  }, [fetchProductDetail]);

  // ドロワーを閉じるハンドラ（useCallbackで最適化）
  const handleCloseDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
    // ドロワーを閉じるときに商品詳細情報をクリア
    clearProductDetail();
  }, [clearProductDetail]);

  // 商品選択のハンドラ（useCallbackで最適化）
  const handleItemSelection = React.useCallback((id: string, shiftKey: boolean) => {
    if (shiftKey) {
      handleRangeSelection(id);
    } else {
      toggleItemSelection(id);
    }
  }, [handleRangeSelection, toggleItemSelection]);

  // 価格ソートのハンドラ（useCallbackで最適化）
  const handleSortOrderChange = React.useCallback(() => {
    setSortOrder(order => {
      if (order === 'none') return 'asc';
      if (order === 'asc') return 'desc';
      return 'none';
    });
  }, [setSortOrder]);

  // 表示/非表示のフィルタリングを適用（useMemoを使用）
  const displayResults = React.useMemo(() => {
    return filteredResults.filter(item => {
      // 選択商品のみ表示モードの場合
      if (showSelectedOnly) {
        return selectedItems.has(item.オークションID);
      }
      // 選択商品を非表示モードの場合
      if (hideSelectedItems) {
        return !selectedItems.has(item.オークションID);
      }
      // どちらでもない場合は全て表示
      return true;
    });
  }, [filteredResults, showSelectedOnly, hideSelectedItems, selectedItems]);

  // ソート処理を適用（useMemoを使用）
  const sortedResults = React.useMemo(() => {
    if (sortOrder === 'none') {
      return displayResults;
    }
    
    return [...displayResults].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.落札金額 - b.落札金額;
      } else {
        return b.落札金額 - a.落札金額;
      }
    });
  }, [displayResults, sortOrder]);

  return (
    <div className="space-y-4">
      {/* ヘッダー情報 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white rounded-lg shadow p-3">
        <div className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{totalCount.toLocaleString()}</span>
          <span>件中</span>
          <span className="font-bold text-gray-900">{results.length.toLocaleString()}</span>
          <span>件表示</span>
          {filteredResults.length !== results.length && (
            <span>
              （絞込み：<span className="font-bold text-gray-900">{filteredResults.length.toLocaleString()}</span>件）
            </span>
          )}
          {currentSearchKeyword && (
            <span className="ml-2 font-medium text-gray-900">「{currentSearchKeyword}」</span>
          )}
          {showSelectedOnly && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 ml-2">
              選択アイテムのみ表示中
            </span>
          )}
          {hideSelectedItems && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800 ml-2">
              選択アイテムを除外中
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 ml-auto">
            {/* 価格ソートボタン */}
            <button
              onClick={handleSortOrderChange}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                sortOrder !== 'none' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {sortOrder === 'asc' ? <ArrowUp size={14} /> : sortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUpDown size={14} />}
              {sortOrder === 'none' ? '価格順' : sortOrder === 'asc' ? '価格: 安い順' : '価格: 高い順'}
            </button>
          </div>
        </div>
      </div>

      {/* 検索結果グリッド/テーブル表示 */}
      {layout === 'grid' ? (
        // グリッドレイアウト表示
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sortedResults.map((item) => (
            <div
              key={item.オークションID}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group"
            >
              {/* PC表示のみ商品選択チェックを表示 */}
              <div className="hidden md:block">
                <button
                  onClick={(e) => {
                    if (e.shiftKey) {
                      handleItemSelection(item.オークションID, e.shiftKey);
                    } else {
                      handleItemSelection(item.オークションID, e.shiftKey);
                    }
                  }}
                  className={`absolute top-2 right-2 z-10 p-1 rounded-full ${
                    selectedItems.has(item.オークションID)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedItems.has(item.オークションID) ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
              </div>
              
              {/* 商品全体をクリック可能に - 詳細ページを開く */}
              <div className="cursor-pointer" onClick={(e) => handleProductClick(item, e)}>
                {/* 商品画像とタグ */}
                <div className="block aspect-square relative">
                  <img
                    src={item.画像URL || NO_IMAGE_URL}
                    alt={item.商品名 || 'タイトルなし'}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = NO_IMAGE_URL;
                    }}
                    loading="lazy"
                    aria-hidden="false"
                    aria-label={`${item.商品名 || 'タイトルなし'} の画像`}
                  />
                  {/* 商品タグ表示 */}
                  <div className="absolute top-0 left-0 p-2 flex flex-wrap gap-1 max-w-[calc(100%-48px)]">
                    {getProductTags(item.商品名 || '').map((tag, index) => (
                      <span
                        key={`product-${index}`}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tag.color} shadow-sm backdrop-blur-[2px]`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  {/* 価格情報 */}
                  <div className="absolute bottom-0 left-0 px-2 py-1 m-2 rounded bg-black/60 backdrop-blur-[2px]">
                    <PriceDisplay price={item.落札金額 ?? 0} bidCount={item.入札数 ?? 0} />
                  </div>
                </div>
                
                {/* 商品名と終了日 */}
                <div className="p-2">
                  <div className="space-y-1">
                    <h3 
                      className="text-xs font-medium text-gray-800 line-clamp-2"
                      onMouseEnter={(e) => handleMouseEnter(item.商品名 || '', e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.商品名 || 'タイトルなし'}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>{item.終了日 || '終了日不明'}</span>
                        {/* 落札日の古さを示すタグ - 落札日の横に表示 */}
                        {getAgeTag(item.終了日 || '') && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getAgeTag(item.終了日 || '')?.color}`}
                          >
                            <Calendar size={10} />
                            {getAgeTag(item.終了日 || '')?.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // テーブルレイアウト表示
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-14 hidden md:table-cell">
                    <input 
                      type="checkbox"
                      className="w-5 h-5 rounded text-blue-500 focus:ring-blue-400"
                      checked={sortedResults.length > 0 && sortedResults.every(item => selectedItems.has(item.オークションID || ''))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">商品名</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">現在価格</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">入札数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap w-36">終了日時</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedResults.map((item) => (
                  <tr 
                    key={item.オークションID} 
                    className="group hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleProductClick(item, e)}
                  >
                    <td className="px-2 py-3 text-center hidden md:table-cell" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        className={`w-5 h-5 rounded text-blue-500 focus:ring-blue-400 ${
                          !selectedItems.has(item.オークションID) 
                            ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' 
                            : ''
                        }`}
                        checked={selectedItems.has(item.オークションID)}
                        onChange={(e) => {
                          handleItemSelection(item.オークションID, false);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.shiftKey) {
                            e.preventDefault();
                            handleItemSelection(item.オークションID, true);
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="cursor-pointer"
                            aria-label={`${item.商品名 || 'タイトルなし'} の画像`}
                          >
                            <ImageMagnifier 
                              src={item.画像URL || NO_IMAGE_URL}
                              alt={item.商品名 || 'タイトルなし'}
                              width="94px"
                              height="94px"
                              className="w-[94px] h-[94px] object-cover bg-white rounded border hover:ring-2 hover:ring-blue-500"
                              fallbackSrc={NO_IMAGE_URL}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div 
                            className="text-sm text-gray-900 line-clamp-2 cursor-text select-text"
                            onClick={e => e.stopPropagation()}
                          >
                            {item.商品名 || 'タイトルなし'}
                          </div>
                          {/* テーブルビューのタグ表示 */}
                          <div className="flex flex-wrap gap-1 mt-1 mb-1">
                            {getProductTags(item.商品名 || '').map((tag, index) => (
                              <span 
                                key={`table-${index}`}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color} w-fit`}
                                onClick={e => e.stopPropagation()}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <TablePriceDisplay price={item.落札金額 ?? 0} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <BidCountDisplay count={item.入札数 ?? 0} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">{item.終了日 || '終了日不明'}</span>
                        {/* 落札日の古さを示すタグ - テーブルビューの落札日の下に表示 */}
                        {getAgeTag(item.終了日 || '') && (
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getAgeTag(item.終了日 || '')?.color} w-fit`}
                          >
                            <Calendar size={10} />
                            {getAgeTag(item.終了日 || '')?.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <a
                        href={getAuctionUrl(item.オークションID || '', item.終了日 || '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ツールチップ */}
      {tooltipContent && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-sm pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* 商品詳細ドロワー */}
      <ProductDrawer 
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        product={selectedProduct}
        productDetail={productDetail}
        isLoading={isLoading}
        error={error}
        getProductTags={getProductTags}
        getAuctionUrl={getAuctionUrl}
        statistics={statistics}
      />
    </div>
  );
};

export default ResultsList;