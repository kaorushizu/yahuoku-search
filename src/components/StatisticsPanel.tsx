import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Statistics } from '../types';

interface StatisticsPanelProps {
  statistics: Statistics | null;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ statistics }) => {
  if (!statistics) return null;

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">中央値</div>
          <div className="font-bold text-gray-900 text-lg text-center">
            ¥{statistics.median.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">平均値</div>
          <div className="font-bold text-gray-900 text-lg text-center">
            ¥{Math.round(statistics.average).toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">最高値</div>
          <div className="font-bold text-gray-900 text-lg text-center">
            ¥{statistics.max.toLocaleString()}
          </div>
        </div>
        <div className="bg-gray-100 rounded-md p-2">
          <div className="text-sm text-gray-600 mb-0.5">最安値</div>
          <div className="font-bold text-gray-900 text-lg text-center">
            ¥{statistics.min.toLocaleString()}
          </div>
        </div>
      </div>
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