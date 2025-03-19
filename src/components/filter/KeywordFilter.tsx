import { useState } from 'react';
import { Tag, CheckCircle2 } from 'lucide-react';

interface KeywordFilterProps {
  filterKeywords: string[];
  onChange: (keywords: string[]) => void;
}

/**
 * キーワードフィルタコンポーネント
 * 特定のキーワードを含む商品だけを表示するためのフィルタ
 */
export const KeywordFilter = ({ filterKeywords, onChange }: KeywordFilterProps) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !filterKeywords.includes(newKeyword.trim())) {
      onChange([...filterKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    onChange(filterKeywords.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Tag size={16} className="text-gray-600" />
        <span className="text-sm font-medium text-gray-700">含むキーワード</span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="含むキーワード"
            className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md"
          />
          {newKeyword && (
            <button
              onClick={handleAddKeyword}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>

        {filterKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filterKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 