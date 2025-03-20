import React from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Statistics } from '../../types';

interface StatisticsPanelProps {
  statistics: Statistics;
  isCompact?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

/**
 * 統計情報パネルコンポーネント
 * 検索結果の統計情報を表示します
 */
const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ 
  statistics, 
  isCompact = false, 
  isVisible = true,
  onToggleVisibility
}) => {
  const renderStats = () => (
    <div className={`grid ${isCompact ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
      <div className="bg-gray-100 rounded-md p-2">
        <div className="text-sm text-gray-600 mb-0.5">中央値</div>
        <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.median.toLocaleString()}</div>
      </div>
      <div className="bg-gray-100 rounded-md p-2">
        <div className="text-sm text-gray-600 mb-0.5">平均値</div>
        <div className="font-bold text-gray-900 text-lg text-center">¥{Math.round(statistics.average).toLocaleString()}</div>
      </div>
      <div className="bg-gray-100 rounded-md p-2">
        <div className="text-sm text-gray-600 mb-0.5">最高値</div>
        <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.max.toLocaleString()}</div>
      </div>
      <div className="bg-gray-100 rounded-md p-2">
        <div className="text-sm text-gray-600 mb-0.5">最安値</div>
        <div className="font-bold text-gray-900 text-lg text-center">¥{statistics.min.toLocaleString()}</div>
      </div>
    </div>
  );

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
        {isVisible && renderStats()}
      </div>
    );
  }

  // メイン表示（グラフ付き）
  return (
    <div className="bg-white rounded-lg shadow p-3">
      {renderStats()}
      {/* 価格分布グラフ */}
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statistics.priceRanges}>
            <XAxis 
              dataKey="range" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{fontSize: 10}}
            />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatisticsPanel; 