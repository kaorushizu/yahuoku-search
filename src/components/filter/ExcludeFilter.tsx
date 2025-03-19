import { useState } from 'react';
import { Tag, CheckCircle2 } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { FilterOptions } from '../../types/filter';

interface ExcludeFilterProps {
  excludeOptions: FilterOptions;
  onChange: (options: Partial<FilterOptions>) => void;
}

/**
 * 除外フィルタコンポーネント
 * 特定条件の商品を除外するためのフィルタ
 */
export const ExcludeFilter = ({ excludeOptions, onChange }: ExcludeFilterProps) => {
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');

  const handleAddExcludeKeyword = () => {
    if (newExcludeKeyword.trim() && !excludeOptions.excludeKeywords.includes(newExcludeKeyword.trim())) {
      onChange({
        excludeKeywords: [...excludeOptions.excludeKeywords, newExcludeKeyword.trim()]
      });
      setNewExcludeKeyword('');
    }
  };

  const handleRemoveExcludeKeyword = (index: number) => {
    onChange({
      excludeKeywords: excludeOptions.excludeKeywords.filter((_, i) => i !== index)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newExcludeKeyword.trim()) {
      e.preventDefault();
      handleAddExcludeKeyword();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <Tag size={16} className="text-red-600" />
        <span className="text-sm font-medium text-gray-700">除外条件</span>
      </div>

      {/* 除外キーワード */}
      <div className="space-y-2">
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={newExcludeKeyword}
            onChange={(e) => setNewExcludeKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="除外キーワード"
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
          />
          {newExcludeKeyword && (
            <button
              onClick={handleAddExcludeKeyword}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>

        {excludeOptions.excludeKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {excludeOptions.excludeKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveExcludeKeyword(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 除外ボタン */}
      <div className="flex flex-wrap gap-1">
        <Tooltip text="「入札1」を除外">
          <button
            onClick={() => onChange({ excludeMultipleBids: !excludeOptions.excludeMultipleBids })}
            className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
              excludeOptions.excludeMultipleBids
                ? 'bg-red-50 text-red-700 border-red-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            入札1
          </button>
        </Tooltip>
        <Tooltip text="「ジャンク」「現状品」を除外">
          <button
            onClick={() => onChange({ excludeJunk: !excludeOptions.excludeJunk })}
            className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
              excludeOptions.excludeJunk
                ? 'bg-red-50 text-red-700 border-red-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            ジャンク
          </button>
        </Tooltip>
        <Tooltip text="「まとめ」「セット」を除外">
          <button
            onClick={() => onChange({ excludeSets: !excludeOptions.excludeSets })}
            className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
              excludeOptions.excludeSets
                ? 'bg-red-50 text-red-700 border-red-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            セット
          </button>
        </Tooltip>
        <Tooltip text="「新品」「未使用」「未開封」を除外">
          <button
            onClick={() => onChange({ excludeNew: !excludeOptions.excludeNew })}
            className={`px-2 py-1.5 border rounded text-xs transition-colors duration-200 ${
              excludeOptions.excludeNew
                ? 'bg-red-50 text-red-700 border-red-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            新品
          </button>
        </Tooltip>
      </div>
    </div>
  );
}; 