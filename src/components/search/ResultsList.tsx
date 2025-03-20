import React from 'react';
import { ExternalLink, CheckCircle2, Circle, Package2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import ImageMagnifier from '../common/ImageMagnifier';
import { AuctionItem, ProductTag, SortOrder } from '../../types';

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
}

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
  setLayout
}) => {
  return (
    <div className="space-y-4">
      {/* ヘッダー情報 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 bg-white rounded-lg shadow p-3">
        <div className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">{filteredResults.length.toLocaleString()}</span>
          <span className="mx-1">件表示</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Package2 size={16} />
            <span>{filteredResults.length.toLocaleString()}件</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {/* レイアウト切り替えボタン */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
              <button
                onClick={() => setLayout('grid')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                  layout === 'grid'
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                グリッド
              </button>
              <button
                onClick={() => setLayout('table')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                  layout === 'table'
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                テーブル
              </button>
            </div>
            
            {/* 価格ソートボタン */}
            <button
              onClick={() => {
                setSortOrder(order => {
                  if (order === 'none') return 'asc';
                  if (order === 'asc') return 'desc';
                  return 'none';
                });
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${
                sortOrder === 'none' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredResults.map((item) => (
            <div
              key={item.オークションID}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200 relative group"
            >
              {/* 商品選択チェック */}
              <button
                onClick={(e) => {
                  if (e.shiftKey) {
                    handleRangeSelection(item.オークションID);
                  } else {
                    toggleItemSelection(item.オークションID);
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
              
              {/* 商品画像とタグ (リンク付き) */}
              <a
                href={getAuctionUrl(item.オークションID, item.終了日)}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square relative"
              >
                <img
                  src={item.画像URL}
                  alt={item.商品名}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                  }}
                />
                {/* 商品タグ表示 */}
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
                {/* 価格情報 */}
                <div className="absolute bottom-0 left-0 px-2 py-1 m-2 rounded bg-black/60 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2">
                    <div className="text-white text-lg font-bold drop-shadow">¥{item.落札金額.toLocaleString()}</div>
                    <div className="text-white text-xs font-medium">{item.入札数}件</div>
                  </div>
                </div>
              </a>
              
              {/* 商品名と終了日 (リンクなし) */}
              <div className="p-2">
                <div className="space-y-1">
                  <h3 className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:line-clamp-none transition-all duration-200">
                    {item.商品名}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>{item.終了日}</span>
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
                  <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 w-8">
                    {/* テーブルヘッダー、全選択ボタンは親コンポーネントで制御 */}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">商品名</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">現在価格</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 whitespace-nowrap">入札数</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 whitespace-nowrap">終了日時</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((item) => (
                  <tr key={item.オークションID} className="group hover:bg-gray-50">
                    <td className="px-2 py-3">
                      <button
                        onClick={(e) => {
                          if (e.shiftKey) {
                            handleRangeSelection(item.オークションID);
                          } else {
                            toggleItemSelection(item.オークションID);
                          }
                        }}
                        className={`p-1 rounded-full transition-opacity duration-200 ${
                          selectedItems.has(item.オークションID)
                            ? 'bg-blue-500 text-white opacity-100'
                            : 'bg-white text-gray-400 border opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {selectedItems.has(item.オークションID) ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <a
                            href={getAuctionUrl(item.オークションID, item.終了日)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={item.画像URL}
                              alt={item.商品名}
                              className="w-16 h-16 object-cover bg-white rounded border cursor-pointer hover:ring-2 hover:ring-blue-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                              }}
                            />
                          </a>
                          <ImageMagnifier 
                            src={item.画像URL} 
                            alt={item.商品名}
                            width="64px"
                            height="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {item.商品名}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getProductTags(item.商品名).map((tag, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${tag.color}`}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ¥{item.落札金額.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.入札数}件</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.終了日}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={getAuctionUrl(item.オークションID, item.終了日)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700"
                      >
                        <ExternalLink size={12} />
                        開く
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList; 