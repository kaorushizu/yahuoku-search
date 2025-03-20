import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';

interface PriceRangeFilterProps {
  min: number;
  max: number;
  onAddPriceRange: (min: number, max: number, label: string) => void;
  customRanges?: Array<[number, number, string]>; // [min, max, label]
}

const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  min,
  max,
  onAddPriceRange,
  customRanges = []
}) => {
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const handleSliderChange = (values: [number, number]) => {
    setMinValue(values[0]);
    setMaxValue(values[1]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setMinValue(Math.min(value, maxValue));
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setMaxValue(Math.max(value, minValue));
    }
  };

  const handleAddRange = () => {
    // ラベルを生成
    const label = maxValue === Number.MAX_SAFE_INTEGER
      ? `¥${minValue.toLocaleString()}以上`
      : `¥${minValue.toLocaleString()}～¥${maxValue.toLocaleString()}`;
    
    onAddPriceRange(minValue, maxValue, label);
  };

  const handleSelectCustomRange = (rangeMin: number, rangeMax: number, label: string) => {
    onAddPriceRange(rangeMin, rangeMax, label);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">価格範囲</h3>
      
      <div className="mb-4">
        <Slider
          min={min}
          max={max}
          value={[minValue, maxValue]}
          onChange={handleSliderChange}
          step={1000}
        />
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">最小価格</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              ¥
            </div>
            <Input
              type="number"
              value={minValue}
              onChange={handleMinInputChange}
              className="pl-7"
              min={0}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">最大価格</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              ¥
            </div>
            <Input
              type="number"
              value={maxValue}
              onChange={handleMaxInputChange}
              className="pl-7"
              min={0}
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleAddRange}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded py-2 flex items-center justify-center gap-1 text-sm"
      >
        <Plus size={16} />
        価格範囲を追加
      </button>
      
      {customRanges.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2">一般的な価格範囲:</h4>
          <div className="flex flex-wrap gap-2">
            {customRanges.map(([rangeMin, rangeMax, label], index) => (
              <button
                key={index}
                onClick={() => handleSelectCustomRange(rangeMin, rangeMax, label)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRangeFilter; 