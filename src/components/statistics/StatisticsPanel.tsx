import React from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Rectangle, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Statistics } from '../../types';

interface PriceRange {
  min: number;
  max: number;
  range: string;
}

interface StatisticsPanelProps {
  statistics: Statistics;
  currentStatistics?: Statistics | null;
  isCompact?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onPriceRangeClick?: (rangeStart: number, rangeEnd: number, rangeText: string) => void;
  selectedPriceRanges?: PriceRange[];
  hasActiveFilters?: boolean;
  hasActivePriceFilters?: boolean;
  maxWidth?: string;
  onClearAllPriceRanges?: () => void;
}

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded text-xs">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-blue-600">
          <span className="font-medium">{payload[0].value}</span> 件の商品
        </p>
        <p className="text-gray-500 mt-1">クリックして選択</p>
      </div>
    );
  }
  return null;
};

/**
 * 統計情報パネルコンポーネント
 * 検索結果の統計情報を表示します
 */
const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ 
  statistics, 
  currentStatistics = null,
  isCompact = false, 
  isVisible = true,
  onToggleVisibility,
  onPriceRangeClick,
  selectedPriceRanges = [],
  hasActiveFilters = false,
  hasActivePriceFilters = false,
  maxWidth,
  onClearAllPriceRanges
}) => {
  const handleBarClick = (data: any) => {
    if (!onPriceRangeClick) return;
    
    // 価格範囲を解析
    const rangeText = data.range;
    
    // グローバルフラグ(g)を使用してすべての¥記号を削除
    const prices = rangeText.replace(/¥/g, '').split('~').map((price: string) => {
      // カンマを除去して数値に変換
      return price ? Number(price.replace(/,/g, '')) : Number.MAX_SAFE_INTEGER;
    });
    
    // レンジの開始値と終了値を確認してからコールバックを呼び出す
    const rangeStart = !isNaN(prices[0]) ? prices[0] : 0;
    const rangeEnd = !isNaN(prices[1]) ? prices[1] : Number.MAX_SAFE_INTEGER;
    
    onPriceRangeClick(rangeStart, rangeEnd, rangeText);
  };

  // 価格範囲が選択されているか確認する関数
  const isPriceRangeSelected = (rangeStart: number, rangeEnd: number) => {
    // 価格帯フィルターが適用されていない場合は、全て青く表示（選択状態）
    if (!hasActivePriceFilters) {
      return true;
    }
    
    // 価格範囲フィルターが設定されている場合
    if (selectedPriceRanges.length > 0) {
      // 対象の価格範囲が選択されているかどうかを確認
      return selectedPriceRanges.some(
        range => range.min === rangeStart && range.max === rangeEnd
      );
    }
    
    // 価格範囲フィルターがあるが、指定された範囲が選択されていない場合はグレー
    return false;
  };

  // 価格範囲をパースする関数
  const parseRangeFromText = (rangeText: string) => {
    const prices = rangeText.replace(/¥/g, '').split('~').map(price => {
      return price ? Number(price.replace(/,/g, '')) : Number.MAX_SAFE_INTEGER;
    });
    
    return {
      start: !isNaN(prices[0]) ? prices[0] : 0,
      end: !isNaN(prices[1]) ? prices[1] : Number.MAX_SAFE_INTEGER
    };
  };

  const renderStats = () => {
    // 表示するデータを決定（フィルタリングされた結果があればそれを使用）
    const displayStats = currentStatistics || statistics;
    
    return (
      <div className={`grid ${isCompact ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">中央値</div>
          <div className="font-bold text-gray-900 text-lg text-center">¥{Math.round(displayStats.median).toLocaleString()}</div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">平均値</div>
          <div className="font-bold text-gray-900 text-lg text-center">¥{Math.round(displayStats.average).toLocaleString()}</div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">最高値</div>
          <div className="font-bold text-gray-900 text-lg text-center">¥{displayStats.max.toLocaleString()}</div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">最安値</div>
          <div className="font-bold text-gray-900 text-lg text-center">¥{displayStats.min.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  // サイドバー用コンパクト表示
  if (isCompact) {
    return (
      <div className="bg-white rounded-lg shadow p-3 transition-all duration-300">
        <button
          onClick={onToggleVisibility}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          <div className="flex items-center gap-1.5">
            <Calculator size={16} />
            統計情報
          </div>
          {isVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isVisible && (
          <>
            {renderStats()}
          </>
        )}
      </div>
    );
  }

  // メイン表示（グラフ付き）
  return (
    <div className="bg-white rounded-lg shadow p-3">
      {renderStats()}
      {/* 価格分布グラフ */}
      <div className="mt-4">
        {/* 選択したフィルターをクリアするボタン */}
        {selectedPriceRanges && selectedPriceRanges.length > 0 && onClearAllPriceRanges && (
          <div className="flex justify-end mb-2">
            <button 
              onClick={onClearAllPriceRanges}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
            >
              選択した価格範囲をクリア
            </button>
          </div>
        )}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statistics.priceRanges} barGap={0} barCategoryGap={1}>
              <XAxis 
                dataKey="range" 
                angle={0}
                textAnchor="middle"
                height={60}
                interval={0}
                tick={{fontSize: 11}}
              />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                onClick={handleBarClick}
                cursor={onPriceRangeClick ? 'pointer' : 'default'}
                isAnimationActive={false}
                maxBarSize={100}
              >
                {statistics.priceRanges.map((entry, index) => {
                  const range = parseRangeFromText(entry.range);
                  const selected = isPriceRangeSelected(range.start, range.end);
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selected ? '#3b82f6' : '#94a3b8'} 
                      stroke={selected ? '#2563eb' : '#64748b'}
                      strokeWidth={selected ? 1 : 0}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel; 